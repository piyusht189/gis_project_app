import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styles from './SideMenu.style';
import AsyncStorage from '@react-native-community/async-storage'
import { NavigationActions } from 'react-navigation';
import { ScrollView, Text, TouchableOpacity, View, Image, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { StackActions } from 'react-navigation';
import messaging from '@react-native-firebase/messaging';
import Toast from 'react-native-simple-toast';
class SideMenu extends Component {
    token
    did_holder
    constructor(props) {
        super(props);
        this.state = {
            mapclicked: false,
            notifications_count: 0,
            independent: false
        }
    }
    async componentDidMount(){
    
        let value = await AsyncStorage.getItem('user');
        value = JSON.parse(value);
        this.did_holder = value.aadid;
        this.token = value.token;
        this.setState({ independent: value.independent  == 'yes' ? true : false })
        this.getNotifications();
      }
    getNotifications(){
        fetch('https://drivecraftlab.com/backend/api/notifications/get_driver_notifications.php?token=' + this.token, {
        method: 'POST',
        body: JSON.stringify({
          did: this.did_holder
        })
        })
        .then((response) => response.json())
        .then((responseJson) => {
        
        if(responseJson.status_code == 200){
            let filtered = responseJson.notifications.filter(e => {
                return e['read_yet'] == '0'
            });
            this.setState({notifications_count : filtered.length, loading: false});
            
            
        }else if(responseJson.status_code == 800){
            this.logoutRequest();
        }else{
            Toast.show(responseJson.message, Toast.LONG);
        }
        })
        .catch((error) => {
        console.error(error);
        });
    }
    navigateToScreen = (route) => () => {
        const navigateAction = NavigationActions.navigate({
            routeName: route
        });
        this.props.navigation.dispatch(navigateAction);
    }
    logout = () => {
        Alert.alert(
            'Logout',
            'Are you sure to logout?',
            [
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                { text: 'Log Out', onPress: () => this.logoutRequest() },
            ],
            { cancelable: false },
        );
    }
     logoutRequest() {
        setTimeout(async () => {
            let user = await AsyncStorage.getItem('user');
            user = JSON.parse(user);
            fetch('https://drivecraftlab.com/backend/api/driver/driver_logout.php?token=logout&aadid=' + user['aadid'], {
                method: 'POST',
                body: JSON.stringify({})
              })
              .then((response) => response.json())
              .then((responseJson) => {
                  if(responseJson["status_code"] == 800){
                    const resetAction = StackActions.reset({
                        index: 0,
                        actions: [NavigationActions.navigate({ routeName: 'Login', params: { logout: true } })]
                    });
                    
                        if (user) {
                            
                            messaging()
                            .unsubscribeFromTopic(user['aadid'] ? 'a' + user['aadid'] : 'r' + user['radid'])
                            .then(() => {
                                console.log("Unsubscribed from " + user['aadid'] ? 'a' + user['aadid'] : 'r' + user['radid'])
                                AsyncStorage.setItem('loggedin', '');
                                AsyncStorage.setItem('user', '');
                                AsyncStorage.setItem('cred', '');
                                this.props.navigation.dispatch(resetAction);
                            });
                        }
                  }else{
                    Toast.show("Network Not Available!", Toast.LONG);
                  }
                
              })
              .catch((error) => {
                console.error(error);
              });


            
        }, 100)
    }
    render() {
        return (
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <Image resizeMode='contain' style={{ alignContent:'center',alignItems:'center',alignSelf:'center', height: 100, width: 200, marginLeft: 3, marginTop: 0, marginRight: 3 }} source={require('../assets/images/logo.png')} />
                </View>
                <ScrollView>
                <View>
                        <TouchableOpacity onPress={this.navigateToScreen('Notification')}
                            style={styles.navSectionStyle}>
                            <Text style={[{backgroundColor: '#5670a3', marginBottom: 0},styles.navItemStyle1]}>
                                <Icon
                                    name='bell' size={25} iconStyle={{ marginLeft: 20, marginBottom: -20 }}
                                    color='#fff'
                                />     <Text style={{ color: '#fff' , fontWeight: 'bold', fontSize: 16}}>{ this.state.notifications_count ?  this.state.notifications_count + ' ' : '0 ' }</Text>new notifications
              </Text>
                        </TouchableOpacity>
                    </View>
                    {this.state.independent &&
                            <View style={{marginTop: 1}}>
                                <TouchableOpacity onPress={this.navigateToScreen('AddDrive')}
                                    style={[styles.navSectionStyle]}>
                                    <Text style={[{backgroundColor: '#5670a3', marginBottom: 0,flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center"},styles.navItemStyle1]}>
                                        <Icon
                                            name='plus' size={25} iconStyle={{ marginLeft: 20 }}
                                            color='#fff'
                                        />      <Text style={{ textAlignVertical: 'center' }}>Add Drive</Text>
                    </Text>
                                </TouchableOpacity>
                            </View>
                    }
                    <View>
                        <TouchableOpacity onPress={this.navigateToScreen('Dashboard')}
                            style={styles.navSectionStyle}>
                            <Text style={styles.navItemStyle}>
                                <Icon
                                    name='th-large' size={25} iconStyle={{ marginLeft: 20, marginBottom: -10 }}
                                    color='#272c36'
                                />      Dashboard
              </Text>
                        </TouchableOpacity>
                    </View>
                    <View>
                        <TouchableOpacity style={styles.navSectionStyle} onPress={this.navigateToScreen('Schedule')}>
                            <Text style={styles.navItemStyle} >
                                <Icon
                                    name='clock-o' size={28} iconStyle={{ marginLeft: 20 }}
                                    color='#272c36'
                                />      Planned Drives
              </Text>
                        </TouchableOpacity>
                    </View>

                    <View>
                        <TouchableOpacity style={styles.navSectionStyle} onPress={this.navigateToScreen('Completed')}>
                            <Text style={styles.navItemStyle} >
                                <Icon
                                    name='check' size={30} iconStyle={{ marginLeft: 20 }}
                                    color='#272c36'
                                />    Completed Drives
              </Text>
                        </TouchableOpacity>
                    </View>

                    <View>
                        <TouchableOpacity style={styles.navSectionStyle} onPress={this.navigateToScreen('Profile')}>
                            <Text style={styles.navItemStyle} >
                                <Icon
                                    name='user' size={30} iconStyle={{ marginLeft: 20 }}
                                    color='#272c36'
                                />      My Profile
              </Text>
                        </TouchableOpacity>
                    </View>
                    
                    <View>
                        <TouchableOpacity style={styles.navSectionStyle} onPress={() => this.logout()}>
                            <Text style={styles.navItemStyle} >
                                <Icon
                                    name='sign-in' size={27} iconStyle={{ marginLeft: 20 }}
                                    color='#272c36'
                                />      Logout
              </Text>
                        </TouchableOpacity>
                    </View>
                    
                </ScrollView>
            </View>
        );
    }
}

SideMenu.propTypes = {
    navigation: PropTypes.object
};
export default SideMenu;
