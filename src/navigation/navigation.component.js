
import { StyleSheet } from 'react-native';
import React from 'react';
import SideMenu from './SideMenu'
import {
    createStackNavigator
} from 'react-navigation-stack';
import { createAppContainer } from 'react-navigation'
import { createDrawerNavigator } from 'react-navigation-drawer'
import NavigationDrawerStructure from './NavigationDrawerStructure'
import DashboardScreen from '../screens/dashboard.component';
import ScheduleScreen from '../screens/scheduled.component';
import CompletedScreen from '../screens/completed.component';
import ProfileScreen from '../screens/profile.component';
import NotificationScreen from '../screens/notifications.component';
import AddDriveScreen from '../screens/adddrive.component';


const Dashboard = createStackNavigator({
    Second: {
        screen: DashboardScreen,
        navigationOptions: ({ navigation }) => ({
            title: 'Dashboard',
            headerLeft: <NavigationDrawerStructure navigationProps={navigation} />,
            headerStyle: {
                backgroundColor: '#272c36',
            },
            headerTintColor: '#fff',
        }),
    },
},
    {
        defaultNavigationOptions: {
            gesturesEnabled: false
        }
    });


const Schedule = createStackNavigator({
    First: {
        screen: ScheduleScreen,
        navigationOptions: ({ navigation }) => ({
            title: 'Drives Schedule',
            headerLeft: <NavigationDrawerStructure navigationProps={navigation} />,
            headerStyle: {
                backgroundColor: '#272c36',
            },
            headerTintColor: '#fff',

        }),
    },
},
    {
        defaultNavigationOptions: {
            gesturesEnabled: false
        }
    });



const Completed = createStackNavigator({
    First: {
        screen: CompletedScreen,
        navigationOptions: ({ navigation }) => ({
            title: 'Drives Completed',
            headerLeft: <NavigationDrawerStructure navigationProps={navigation} />,
            headerStyle: {
                backgroundColor: '#272c36',
            },
            headerTintColor: '#fff',

        }),
    },
},
    {
        defaultNavigationOptions: {
            gesturesEnabled: false
        }
    });


const Profile = createStackNavigator({
        First: {
            screen: ProfileScreen,
            navigationOptions: ({ navigation }) => ({
                title: 'My Profile',
                headerLeft: <NavigationDrawerStructure navigationProps={navigation} />,
                headerStyle: {
                    backgroundColor: '#272c36',
                },
                headerTintColor: '#fff',
    
            }),
        },
    },
        {
            defaultNavigationOptions: {
                gesturesEnabled: false
            }
        });


const Notification = createStackNavigator({
            First: {
                screen: NotificationScreen,
                navigationOptions: ({ navigation }) => ({
                    title: 'Notifications',
                    headerLeft: <NavigationDrawerStructure navigationProps={navigation} />,
                    headerStyle: {
                        backgroundColor: '#272c36',
                    },
                    headerTintColor: '#fff',
        
                }),
            },
        },
            {
                defaultNavigationOptions: {
                    gesturesEnabled: false
                }
            });
const AddDrive = createStackNavigator({
    First: {
        screen: AddDriveScreen,
        navigationOptions: ({ navigation }) => ({
            title: 'Add Drive',
            headerLeft: <NavigationDrawerStructure navigationProps={navigation} />,
            headerStyle: {
                backgroundColor: '#272c36',
            },
            headerTintColor: '#fff',

        }),
    },
},
    {
        defaultNavigationOptions: {
            gesturesEnabled: false
        }
    });


            

const MainNavigation = createDrawerNavigator({
    //Drawer Optons and indexing
    Dashboard: {
        //Title
        screen: Dashboard,
        navigationOptions: {
            drawerLabel: 'Dashboard',
        },
    },

    Schedule: {
        //Title
        screen: Schedule,
        navigationOptions: {
            drawerLabel: 'Planned Drives',
        },
    },

    Completed: {
        //Title
        screen: Completed,
        navigationOptions: {
            drawerLabel: 'Completed Drives',
        },
    },

    Profile: {
        //Title
        screen: Profile,
        navigationOptions: {
            drawerLabel: 'My Profile',
        },
    },

    Notification: {
        //Title
        screen: Notification,
        navigationOptions: {
            drawerLabel: 'Notifications',
        },
    },
    AddDrive: {
        //Title
        screen: AddDrive,
        navigationOptions: {
            drawerLabel: 'Add Drive',
        },
    },
}, {
        contentComponent: SideMenu,
        drawerWidth: 300
    });


export default createAppContainer(MainNavigation);