import React, { Component } from 'react';
import { SafeAreaView, View, Alert, StyleSheet } from 'react-native';
import { Button, Divider, Layout, Text, Icon, Datepicker } from '@ui-kitten/components';
import { Input } from '@ui-kitten/components';
import AsyncStorage from '@react-native-community/async-storage'
import moment from 'moment';
import { MomentDateService } from '@ui-kitten/moment';
import Spinner from 'react-native-loading-spinner-overlay';
import Toast from 'react-native-simple-toast';
import { NavigationActions } from 'react-navigation';
import messaging from '@react-native-firebase/messaging';
import { StackActions } from 'react-navigation';
class ProfileScreen extends Component {
  token
  state = {
    did: '',
    demail: '',
    dname: '',
    ddob: moment(),
    dpassword: '',
    dphone: '',
    user_obj : {},
    loading: false
  }
  dateService = new MomentDateService();
  async componentDidMount(){
    let value = await AsyncStorage.getItem('user')
    value = JSON.parse(value);
    this.token = value.token;
    this.setState({
      user_obj: value,
      did: value.aadid,
      demail: value.demail,
      dname: value.dname,
      ddob: moment(value.ddob),
      dphone: value.dphone
    })
  }
  navbutton = () => {
    <Icon name='menu-outline' />
  }
  _storeData = async () => {
    try {
      await AsyncStorage.setItem('user',JSON.stringify(this.state.user_obj));
      } catch (e) {
        Toast.show(e.message, Toast.LONG);
    }
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
  saveProfile(){
    this.setState({loading: true});
    fetch('https://drivecraftlab.com/backend/api/user/driver_update.php?token=' + this.token, {
        method: 'POST',
        body: JSON.stringify({
          aadid: this.state.did,
          dname: this.state.dname,
          dphone: this.state.dphone,
          ddob: moment(this.state.ddob).format('YYYY-MM-DD'),
          dpassword: this.state.dpassword
        })
    })
    .then((response) => response.json())
    .then((responseJson) => {
      
      if(responseJson.status_code == 200){
       
        this.setState({loading: false});
        Toast.show(responseJson.message, Toast.LONG);
        let userobj = this.state.user_obj;
        userobj.dname = this.state.dname,
        userobj.dphone = this.state.dphone,
        userobj.ddob = moment(this.state.ddob).format('YYYY-MM-DD');
        this.setState({user_obj: userobj});
        this._storeData();
        
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
  render() {
    return (
    <SafeAreaView style={{ flex: 1 }}>
      <Layout style={styles.container} level='1'>
      <Spinner
          visible={this.state.loading}
          overlayColor={'#aaaaaaff'}
          textContent={'Hold on...'}
          textStyle={styles.spinnerTextStyle}
        />
      <View style={{margin:20}}>
      <Text style={{ marginVertical : 10 }} status='primary'>Full Name</Text>
        <Input
          placeholder='Enter Full Name'
          status='primary'
          value={this.state.dname}
          onChangeText={nextValue => this.setState({dname: nextValue})}
        />
         <Text style={{ marginVertical : 10 }} status='primary'>Date of Birth</Text>
        <Datepicker
          placeholder='Set Date of Birth'
          date={this.state.ddob}
          max={moment()}
          min={moment('1900-01-01','YYYY-MM-DD')}
          status='primary'
          dateService={this.dateService}
          onSelect={nextDate => this.setState({ddob: nextDate})}
        />
        <Text style={{ marginVertical : 10 }} status='primary'>Email</Text>
        <Input
          placeholder='Enter Your Email'
          status='primary'
          value={this.state.demail}
          onChangeText={nextValue => this.setState({demail: nextValue})}
        />
        <Text style={{ marginVertical : 10 }} status='primary'>Phone</Text>
        <Input
          placeholder='Enter Phone Number'
          status='primary'
          value={this.state.dphone}
          onChangeText={nextValue => this.setState({dphone: nextValue})}
        />
        <Text style={{ marginVertical : 10 }} status='primary'>New Password</Text>
        <Input
          placeholder='To Change Password'
          status='primary'
          value={this.state.dpassword}
          onChangeText={nextValue => this.setState({dpassword: nextValue})}
        />
        <Button onPress={()=> this.saveProfile() } style={{marginVertical: 20}} disabled={!this.state.dname || !this.state.demail || !this.state.ddob || !this.state.dphone}>
          Save Profile
        </Button>
      </View>
      </Layout>
    </SafeAreaView>
   );
  }
};

export default ProfileScreen;
const styles = StyleSheet.create({
  container: {
    minHeight: 360,
  },
});