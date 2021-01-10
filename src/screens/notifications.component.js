import React, { Component } from 'react';
import { SafeAreaView, Text, StyleSheet, Dimensions, View,Alert, TouchableOpacity, Image } from 'react-native';
import { Button, Divider, Layout, TopNavigation, TopNavigationAction, Toggle, Card, List, Modal} from '@ui-kitten/components';
import moment from "moment";
import 'moment-timezone';
import 'moment/min/moment-with-locales'
import CustomMarker from "./customMarker";
import AsyncStorage from '@react-native-community/async-storage'
import MapView, { Marker, Polyline } from 'react-native-maps';
import { mapStyle } from './mapStyle'
let ScreenHeight = Dimensions.get("window").height;
let ScreenWidth = Dimensions.get("window").width;
import Toast from 'react-native-simple-toast';
import Spinner from 'react-native-loading-spinner-overlay';
import { NavigationActions } from 'react-navigation';
import { StackActions } from 'react-navigation';
import messaging from '@react-native-firebase/messaging';
class NotificationScreen extends Component {
  did_holder
  token
  state = {
    notifications: [],
    loading: true,
    new_notifications_count: 0
  } 
  static navigationOptions = ({ navigation }) =>  {
    return {
    headerRight: (
      <View style={{ flexDirection: 'row' }}>
      <TouchableOpacity onPress={navigation.getParam('_getDrives')}>
          <Image
              source={require('../assets/images/reloadbtn.png')}
              style={{ width: 20, height: 20, marginRight: 15 }}
          />
      </TouchableOpacity>
    </View>
    )
   }
  };
  async componentDidMount(){
    this.props.navigation.setParams({ _getDrives: this.getNotifications });
    let value = await AsyncStorage.getItem('user');
    value = JSON.parse(value);
    this.did_holder = value.aadid;
    this.token = value.token;
    this.getNotifications()
  }
  readAll(){
    fetch('https://drivecraftlab.com/backend/api/notifications/read_all_driver_notifications.php?token=' + this.token, {
      method: 'POST',
      body: JSON.stringify({
        did: this.did_holder
      })
      })
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({loading: false});
      if(responseJson.status_code == 200){
   
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
  getNotifications = () => {
    this.setState({loading: true})
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
        if(filtered.length){
          this.readAll();
          this.setState({new_notifications_count : filtered.length, notifications: responseJson.notifications});
       
        }else{
          this.setState({new_notifications_count : filtered.length, notifications: responseJson.notifications, loading: false});
       
        }
        
    }else if(responseJson.status_code == 800){
        this.logoutRequest();
    }else{
        this.setState({loading: false});
        Toast.show(responseJson.message, Toast.LONG);
    }
    })
    .catch((error) => {
    console.error(error);
    });
}
 
  navbutton = () => {
    <Icon name='menu-outline' />
  }
  logoutRequest() {
    setTimeout(async () => {
        const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: 'Login', params: { logout: true } })]
        });
        let user = await AsyncStorage.getItem('user');
            if (user) {
                user = JSON.parse(user);
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
    }, 100)
}
  getFormatted(data){
    return data ? moment.utc(data,'YYYY-MM-DD HH:mm:ss').tz('Asia/Kuwait').format('DD/MM/YYYY hh:mm A') : 'NA'
  }

  
  
  renderItem = (info) => (
    <Card style={[styles.item, info.item.read_yet == '0' ? styles.greybg : styles.whitebg]}>
    <View>
      <Text style={{fontSize: 16, fontWeight:'700'}}>{ info.item.title }</Text>
          <Text style={{ fontSize: 11, paddingTop: 3, paddingBottom: 2, color: '#b17900', marginTop: 7, marginLeft: 0, fontWeight: '700'  }}>{ info.item.body }</Text>
          <View style={{ flexDirection:'row' }}>
          <Text style={{ fontSize: 12, borderWidth:1, borderColor: '#00a0a0',borderStyle:'dotted', borderRadius: 25, paddingTop: 3, paddingBottom: 2, paddingHorizontal: 12, color: '#00a0a0', marginTop: 7, marginLeft: 0, fontWeight: '700'  }}>Sent At</Text>
          <Text style={{ color: '#00a0a0', marginTop: 10 }}>----</Text>
          <Text style={{ fontSize: 12,borderWidth:1, borderColor: '#00a0a0',borderStyle:'dotted', borderRadius: 25, paddingTop: 3, paddingBottom: 2, paddingHorizontal: 12, color: '#00a0a0', marginTop: 7, marginLeft: 0, fontWeight: '700'  }}>{ this.getFormatted(info.item.sent_at) }</Text>
          </View>
      
    </View>
    </Card>
 );
  render() {
    return (
    <SafeAreaView style={{ flex: 1 }}>
      <Spinner
          visible={this.state.loading}
          overlayColor={'#aaaaaaff'}
          textContent={'Hold on...'}
          textStyle={styles.spinnerTextStyle}
        />
      {this.state.notifications.length == 0 &&
        <Text style={{ flex: 1, margin: 20, textAlign: 'center' }}>No Notifications</Text>
      }
      {this.state.notifications.length != 0 &&
        <List
          contentContainerStyle={styles.contentContainer}
          data={this.state.notifications}
          renderItem={this.renderItem}
        />
      }
    </SafeAreaView>
  );
  }
};

export default NotificationScreen;


const styles = StyleSheet.create({
  greybg: {
    backgroundColor: '#e6f0f5'
  },
  whitebg:{
    backgroundColor: '#fff'
  },
  vehicleLabel:{
    fontSize: 14,
    fontWeight: '700',
    color: '#9c27b0'
  },
  vehicleValue: {
    fontSize: 12,
    fontWeight: '400',
    marginBottom: 20
  },
  topContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  layoutDiv : {
    height: ScreenHeight
  },
  card: {
    flex: 1,
    flexDirection: 'column',
    margin: 2,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: ScreenWidth - 50,
    justifyContent: 'center',
    alignContent: 'center',
    marginTop: -7,
    alignSelf: 'center'
  },
  button: {
    marginTop: 8,
    padding: 0,
    flex: 1
  },
  item: {
    marginVertical: 4,
  },
  contentContainer: {
    paddingHorizontal: 2,
    paddingVertical: 4,
    width: ScreenWidth
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  mapContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 50
},
map: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0
},
content: {
  flex: 1,                            // Take up all available space
  backgroundColor: '#aaa',
  justifyContent: 'center',           // Center vertically
  alignItems: 'center',               // Center horizontally
  backgroundColor: '#C2185B',         // Darker background for content area
},

});