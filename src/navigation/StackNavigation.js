// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import Login from '../Account/Accounts/Login';
// import Loading from '../Account/Accounts/Loading';
// import TabNavigation from './TabNavigation';
// import DrawerNavigation from './DrawerNavigation';
// import CreateCustomer from '../Account/Accounts/dashboardbuttons/CreateCustomer';
// import CreateVisit from '../Account/Accounts/dashboardbuttons/CreateVisit';
// import Stage1 from '../Account/Accounts/Visitbillingforms/Stage1';
// import Stage2 from '../Account/Accounts/Visitbillingforms/Stage2';
// import OpenEnquiry from '../Account/Accounts/dashboardbuttons/OpenEnquiry';
// import Outstanding from '../Account/Accounts/dashboardbuttons/Outstanding/Outstanding';
// import ApprovedList from '../Account/Accounts/dashboardbuttons/ApprovedList';
// import ProductList from '../Account/Accounts/Visitbillingforms/ProductList';
// import VisitSoBillSummary from '../Account/Accounts/dashboardbuttons/salesOrder/VisitSoBillSummary';
// import Deliveries from '../Account/Accounts/dashboardbuttons/Delivery/Deliveries';
// import Reports from '../Account/Accounts/Tabscreens/Reports';
// import Orders from '../Account/Accounts/Tabscreens/Orders';
// import ContactUs from '../Account/Accounts/Drawerscreens/ContactUs';
// import AboutUs from '../Account/Accounts/Drawerscreens/AboutUs';
// import InvoiceDetails from '../Account/Accounts/dashboardbuttons/Invoice/InvoiceDetails';
// import Visitplanning from '../Account/Accounts/dashboardbuttons/Visitplanning';
// const Stack = createNativeStackNavigator();

// const StackNavigation = () => {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator initialRouteName="Loading">
//         <Stack.Screen options={{ headerShown: false }} name="Login" component={Login} />
//         <Stack.Screen options={{ headerShown: false }} name="Loading" component={Loading} />
//         <Stack.Screen name="DrawerNavigation" component={DrawerNavigation} options={{ headerShown: false }} />
//         <Stack.Screen name="TabNavigation" component={TabNavigation} options={{ headerShown: false }} />
//         <Stack.Screen options={{ headerShown: false }} name="CreateCustomer" component={CreateCustomer} />
//         <Stack.Screen options={{ headerShown: false }} name="CreateVisit" component={CreateVisit} />
//         <Stack.Screen options={{ headerShown: false }} name="Stage1" component={Stage1} />
//         <Stack.Screen options={{ headerShown: false }} name="Stage2" component={Stage2} />
//         <Stack.Screen options={{ headerShown: false }} name="OpenEnquiry" component={OpenEnquiry} />
//         <Stack.Screen options={{ headerShown: false }} name="Outstanding" component={Outstanding} />
//         <Stack.Screen options={{ headerShown: false }} name="ApprovedList" component={ApprovedList} />
//         <Stack.Screen options={{ headerShown: false }} name="ProductList" component={ProductList} />
//         <Stack.Screen options={{ headerShown: false }} name="VisitSoBillSummary" component={VisitSoBillSummary} />
//         <Stack.Screen options={{ headerShown: false }} name="Deliveries" component={Deliveries} />
//         <Stack.Screen options={{ headerShown: false }} name="Reports" component={Reports} />
//         <Stack.Screen options={{ headerShown: false }} name="Orders" component={Orders} />
//         <Stack.Screen options={{ headerShown: false }} name="AboutUs" component={AboutUs} />
//         <Stack.Screen options={{ headerShown: false }} name="ContactUs" component={ContactUs} />
//         <Stack.Screen options={{ headerShown: false }} name="InvoiceDetails" component={InvoiceDetails} /> 
//                 <Stack.Screen options={{ headerShown: false }} name="Visitplanning" component={Visitplanning} /> 

//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// };

// export default StackNavigation;

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
export const navigationRef = React.createRef();
import Login from '../Account/Accounts/Login';
import Loading from '../Account/Accounts/Loading';
import TabNavigation from './TabNavigation';
import DrawerNavigation from './DrawerNavigation';
import CreateCustomer from '../Account/Accounts/dashboardbuttons/CreateCustomer';
import CreateVisit from '../Account/Accounts/dashboardbuttons/CreateVisit';
import Stage1 from '../Account/Accounts/Visitbillingforms/Stage1';
import Stage2 from '../Account/Accounts/Visitbillingforms/Stage2';
import OpenEnquiry from '../Account/Accounts/dashboardbuttons/OpenEnquiry';
import Outstanding from '../Account/Accounts/dashboardbuttons/Outstanding/Outstanding';
import ApprovedList from '../Account/Accounts/dashboardbuttons/ApprovedList';
import ProductList from '../Account/Accounts/Visitbillingforms/ProductList';
import VisitSoBillSummary from '../Account/Accounts/dashboardbuttons/salesOrder/VisitSoBillSummary';
import Deliveries from '../Account/Accounts/dashboardbuttons/Delivery/Deliveries';
import Reports from '../Account/Accounts/Tabscreens/Reports';
import Orders from '../Account/Accounts/Tabscreens/Orders';
import ContactUs from '../Account/Accounts/Drawerscreens/ContactUs';
import AboutUs from '../Account/Accounts/Drawerscreens/AboutUs';
import InvoiceDetails from '../Account/Accounts/dashboardbuttons/Invoice/InvoiceDetails';
import Visitplanning from '../Account/Accounts/dashboardbuttons/Visitplanning';

const Stack = createNativeStackNavigator();

const StackNavigation = () => {

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName="Loading">

        <Stack.Screen options={{ headerShown: false }} name="Login" component={Login} />
        <Stack.Screen options={{ headerShown: false }} name="Loading" component={Loading} />
        <Stack.Screen options={{ headerShown: false }} name="DrawerNavigation" component={DrawerNavigation} />
        <Stack.Screen options={{ headerShown: false }} name="TabNavigation" component={TabNavigation} />
        <Stack.Screen options={{ headerShown: false }} name="CreateCustomer" component={CreateCustomer} />
        <Stack.Screen options={{ headerShown: false }} name="CreateVisit" component={CreateVisit} />
        <Stack.Screen options={{ headerShown: false }} name="Stage1" component={Stage1} />
        <Stack.Screen options={{ headerShown: false }} name="Stage2" component={Stage2} />
        <Stack.Screen options={{ headerShown: false }} name="OpenEnquiry" component={OpenEnquiry} />
        <Stack.Screen options={{ headerShown: false }} name="Outstanding" component={Outstanding} />
        <Stack.Screen options={{ headerShown: false }} name="ApprovedList" component={ApprovedList} />
        <Stack.Screen options={{ headerShown: false }} name="ProductList" component={ProductList} />
        <Stack.Screen options={{ headerShown: false }} name="VisitSoBillSummary" component={VisitSoBillSummary} />
        <Stack.Screen options={{ headerShown: false }} name="Deliveries" component={Deliveries} />
        <Stack.Screen options={{ headerShown: false }} name="Reports" component={Reports} />
        <Stack.Screen options={{ headerShown: false }} name="Orders" component={Orders} />
        <Stack.Screen options={{ headerShown: false }} name="AboutUs" component={AboutUs} />
        <Stack.Screen options={{ headerShown: false }} name="ContactUs" component={ContactUs} />
        <Stack.Screen options={{ headerShown: false }} name="InvoiceDetails" component={InvoiceDetails} />
        <Stack.Screen options={{ headerShown: false }} name="Visitplanning" component={Visitplanning} />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNavigation;
