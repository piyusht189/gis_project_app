import React, { Component } from 'react';
import { SafeAreaView, Text, StyleSheet, Dimensions, View,Alert, TouchableOpacity, Image, ScrollView } from 'react-native';
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
import Spinner from 'react-native-loading-spinner-overlay';
import Toast from 'react-native-simple-toast';
import { NavigationActions } from 'react-navigation';
import messaging from '@react-native-firebase/messaging';
import { StackActions } from 'react-navigation';
class ScheduleScreen extends Component {
  did_holder
  token
  value
  state = {
    drives: [],
    loading: false,
    polyline: { show: false, coordinates: [] },
    trackChanges: false,
    visible: false,
    drivePoints: {}
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
    this.props.navigation.setParams({ _getDrives: this.getDrives });
    value = await AsyncStorage.getItem('user');
    value = JSON.parse(value);
    this.token = value.token;
    this.did_holder = value.aadid;
    this.getDrives()
  }
  getDrives = () => {
    this.setState({loading: true})
    fetch('https://drivecraftlab.com/backend/api/task/get_planned_tasks.php?token=' + this.token, {
        method: 'POST',
        body: JSON.stringify({
          did: value.aadid
        })
    })
    .then((response) => response.json())
    .then((responseJson) => {
      if(responseJson.status_code == 200){
       
        if(responseJson.drives.length){
          responseJson.drives = responseJson.drives.map((e,i) => {
            e['work_log'] = JSON.parse(e['work_log']);
            return e;
          });
          this.setState({drives : responseJson.drives.reverse(), loading: false});
        }else{
          this.setState({drives : [], loading: false});
        }
        
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
  navbutton = () => {
    <Icon name='menu-outline' />
  }
  getFormatted(data){
    return data ? moment(data,'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY hh:mm A') : 'NA'
  }
  Footer = (data) => (
    <View style={styles.footerContainer}>
      <Button style={styles.button} appearance='outline' size='small' onPress={() => this.viewDrive(data.item.work_log)} status='primary'>
      View Drive
      </Button>
    </View>
  );
  viewDrive(work_log){
    this.setState({polyline: {show: false, coordinates : []}})
    var polyline = [];
    Object.keys(work_log).forEach(e => {
      polyline.push({latitude: parseFloat(work_log[e]['lat']), longitude: parseFloat(work_log[e]['lng'])});
    })
    this.setState({trackChanges:true, visible: true, drivePoints: work_log, polyline: { show: true, coordinates: polyline}});
    setTimeout(() => {
      this.setState({trackChanges:false})
      this.map.fitToCoordinates(polyline, { edgePadding: { top: 50, right: 50, bottom: 50, left: 50 }, animated: true });
    },1500)
  }
  renderItem = (info) => (
    <Card style={styles.item} footer={() => this.Footer(info)}>
    <View>
      <Text style={{fontSize: 16, fontWeight:'700'}}>{ info.item.work_log['0']['message'] + ' -> ' +  info.item.work_log['1']['message'] + '...'}</Text>
      <Text style={{fontSize: 13}}>Drive is <Text style={{ color: '#671c77', fontWeight: '700' }}>'{ info.item.type }'</Text> { info.item.type == 'One Time Schedule'  ? 'on ' : info.item.type == 'Weekly' ? 'for weekdays ' : info.item.type == 'Monthly' ? 'for month dates as ' : ''  }<Text style={{ color: '#671c77', fontWeight: '700' }}>{ info.item.type == 'One Time Schedule' ? this.getFormatted3(info.item.period,info.item.start_time) : info.item.type == 'Weekly' ? info.item.period : info.item.type == 'Monthly' ? info.item.period : ''  }</Text> </Text>
    </View>
    </Card>
 );
 getFormatted3(period, start_time){
  if(period && start_time){
    return moment.utc(period + ' ' + start_time,'YYYY-MM-DD HHmm').tz('Asia/Kuwait').format('DD/MM/YYYY hh:mm A');
  }else{
    return moment.utc(period,'YYYY-MM-DD').format('DD/MM/YYYY');
  }
}
  render() {
    return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
      <Spinner
          visible={this.state.loading}
          overlayColor={'#aaaaaaff'}
          textContent={'Hold on...'}
          textStyle={styles.spinnerTextStyle}
        />
        {this.state.drives.length == 0 &&
          <Text style={{ flex: 1, margin: 20, textAlign: 'center' }}>No Planned Drives.</Text>
        }
        {this.state.drives.length != 0 &&
          <List
              contentContainerStyle={styles.contentContainer}
              data={this.state.drives}
              renderItem={this.renderItem}
            />
         }
        <Modal
        style={{flex:1, height: ScreenHeight-100, width: ScreenWidth-30 }}
        visible={this.state.visible}
        backdropStyle={styles.backdrop}
        >
        <View disabled={true} style={{flex:1, position:'relative', backgroundColor:'#fff'}}>
        <View style={[styles.mapContainer, { zIndex: 1, backgroundColor: '#000', flexDirection: 'column' }]}>
                    <MapView  showsMyLocationButton={true} showsUserLocation={true}  customMapStyle={mapStyle} showsTraffic={true} ref="map" style={[styles.map]} rotateEnabled={false} ref={(el) => this.map = el}>
                        {Object.keys(this.state.drivePoints).length > 0 &&
                            Object.keys(this.state.drivePoints).map((key, index) => (
                                <Marker ref={this.setRef} tracksViewChanges={this.state.trackChanges} key={this.state.drivePoints[key].lat + this.state.drivePoints[key].message} coordinate={{ latitude: parseFloat(this.state.drivePoints[key].lat), longitude: parseFloat(this.state.drivePoints[key].lng) }}
                                    anchor={{ x: 0.5, y: 0.3 }}>
                                    <CustomMarker message={this.state.drivePoints[key].message} phone={this.state.drivePoints[key].phone} type={index == 0 ? 'start' : Object.keys(this.state.drivePoints).length - 1 == index ? 'end' : 'mid'}/>
                                </Marker>
                            ))
                        }

                         {this.state.polyline.show && <Polyline
                                  coordinates={this.state.polyline.coordinates}
                                  strokeColor="#008E7C"
                                  lineDashPattern={[47.12]}
                                  strokeWidth={3}
                              />
                              }

                        
                    </MapView>
          </View>
          <Button style={{ position: 'absolute', bottom:1, right: 0, left: 0 }} onPress={() => this.setState({visible: false})}>
            Okay
          </Button>
        </View>
      </Modal>
      </ScrollView>
    </SafeAreaView>
  );
  }
};

export default ScheduleScreen;


const styles = StyleSheet.create({
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