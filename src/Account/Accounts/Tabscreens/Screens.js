import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  ScrollView, ImageBackground, ToastAndroid,
  LayoutAnimation,
  UIManager, Platform, BackHandler, Image
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { postcreatevisit, postCustomerList } from '../../../redux/action';
import { useDispatch, useSelector } from 'react-redux';
import { BarChart, LineChart } from 'react-native-chart-kit';
import BarChartSolid from './BarChartSolid';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import DeviceInfo from 'react-native-device-info';

const Screens = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const scrollY = useRef(new Animated.Value(0)).current;


  const isTablet = DeviceInfo.isTablet();

  console.log(isTablet)

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = isTablet ? wp('47%') : wp('45%');
  const chartHeight = isTablet ? hp('26%') : hp('18%');
  const [todayFollowUps, setTodayFollowUps] = useState([]);
  const [showThirdChart, setShowThirdChart] = useState(false);
  const [plannedCount, setPlannedCount] = useState(0);
const [completedCount, setCompletedCount] = useState(0);

  const limit = 10;

  const postcreatevisitData = useSelector(
    (state) => state.postcreatevisitReducer.data["openEnquiryListdata"] || []
  );
  const postcreatevisitLoading = useSelector(
    (state) => state.postcreatevisitReducer.loading["openEnquiryListdata"]
  );
    const postCustomerListPlanned = useSelector(
    (state) => state.postcreatevisitReducer.data["plannedcountdata"] || []
  );
    const postCustomerListCompleted = useSelector(
    (state) => state.postcreatevisitReducer.data["completedcountdata"] || []
  );

  const { postauthendicationData } = useSelector(state => state.postauthendicationReducer);
  const user = postauthendicationData || {};

  const now = new Date();
  const hours = now.getHours();

  let greetingText = '';
  if (hours < 12) {
    greetingText = 'Good Morning';
  } else if (hours < 17) {
    greetingText = 'Good Afternoon';
  } else {
    greetingText = 'Good Evening';
  }

  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  const formattedDate = now.toLocaleDateString('en-US', options);

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true }
  );

  const StatBox = ({ label, color, onPress, labelStyle }) => (
    <TouchableOpacity style={[styles.colorBox, { backgroundColor: color }]} onPress={onPress}>
      <Text style={[styles.boxText, labelStyle]}>{label}</Text>
    </TouchableOpacity>
  );

  const backPressRef = useRef(0);

  const fetchVisitCounts = async () => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const basePayload = {
      jsonrpc: "2.0",
      method: "call",
      params: { model: "customer.visit", method: "search_count", kwargs: {} }
    };

    const plannedPayload = {
      ...basePayload,
      params: {
        ...basePayload.params,
        args: [
          [
            ["followup_date", "=", today],
            ["so_id", "=", false] 
          ]
        ]
      }
    };

    const completedPayload = {
      ...basePayload,
      params: {
        ...basePayload.params,
        args: [
          [
            ["create_date", "=", today],
            ["so_id", "!=", false]  
          ]
        ]
      }
    };

    const dispatchAsync = (payload, key) =>
      new Promise((resolve, reject) => {
        dispatch(postCustomerList(payload, key, (res, err) => {
          if (err) reject(err);
          else resolve(res);
        }));
      });

    const plannedResponse = await dispatchAsync(plannedPayload, "plannedCount");
    const completedResponse = await dispatchAsync(completedPayload, "completedCount");

    setPlannedCount(plannedResponse || 0);
    setCompletedCount(completedResponse || 0);

  } catch (error) {
    console.log("Error fetching visit counts", error);
  }
};


useFocusEffect(
  React.useCallback(() => {
    fetchVisitCounts();
  }, [dispatch])
);

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        const state = navigation.getState();
        const currentRoute = state.routes[state.index];
        const isRootScreen = currentRoute.name === 'Screens'; 

        if (!isRootScreen) {
          navigation.goBack();
          return true;
        }

        const timeNow = Date.now();
        if (backPressRef.current && timeNow - backPressRef.current < 2000) {
          BackHandler.exitApp(); 
          return true;
        }

        backPressRef.current = timeNow;
        ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction
      );

      return () => backHandler.remove();
    }, [navigation])
  );

  useFocusEffect(
    React.useCallback(() => {
      const payload = {
        jsonrpc: "2.0",
        method: "call",
        params: {
          model: "customer.visit",
          method: "search_read",
          args: [],
          kwargs: {
            fields: [
              "id",
              "state",
              "followup_date",
              "name",
              "partner_id",
              "brand",
              "visit_purpose",
              "product_category",
              "required_qty",
              "remarks",
              "so_id",
              "outcome_visit",
              "create_date",
              "billing_branch_id"
            ],
            order: "id desc",
          },
        },
      };

      dispatch(postcreatevisit(payload, "openEnquiryListdata"));
    }, [dispatch])
  );
  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);
  useEffect(() => {
    if (Array.isArray(postcreatevisitData)) {
      const today = new Date().toISOString().split('T')[0];
      const todaysFollowups = postcreatevisitData.filter(item =>
        item.followup_date && new Date(item.followup_date).toISOString().split('T')[0] === today
      );

      const prevIds = todayFollowUps.map(i => i.id).join(',');
      const newIds = todaysFollowups.map(i => i.id).join(',');

      if (prevIds !== newIds) {
        setTodayFollowUps(todaysFollowups);
      }
    }
  }, [postcreatevisitData]);


  if (postcreatevisitLoading) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const handleHorizontalScroll = (event) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    if (scrollX > 150) {
      setShowThirdChart(true);
    }
  };

  return (
    <ImageBackground
      source={require('../../../assets/backgroundimg.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        <View style={styles.container}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{}}
          >
            <View style={{ flexDirection: "row", }}>
              <ImageBackground
                source={require('../../../assets/Rectangle.png')}
                style={[
                  styles.circleBackground1,
                  {
                    width: isTablet ? wp('31%') : wp('30%'),
                    height: isTablet ? hp('31%') : hp('22%'),
                  }
                ]}
              >
                <View style={{ alignItems: 'flex-start', padding: 10 }}>
                  <Text style={[styles.targetTextTitle, { marginLeft: isTablet ? wp('5%') : wp('0.5%'), }]}>Sales Target</Text>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={[styles.targetTextValue, isTablet && { marginLeft: wp('5%') }]}>100 {""} </Text>
                    <Text style={styles.targetTextValue}>MT</Text>
                  </View>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={[styles.targetText, isTablet && { marginLeft: wp('5%') }]}>Achieved</Text>
                    <Text style={styles.targetText1}>{" "}82</Text>
                    <Text style={styles.targetText2}>{" "}MT</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'center', width: '100%', marginBottom: 5, marginTop: 8 }}>
                  <View
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 45,
                      height: 45,
                      borderRadius: 50,
                      backgroundColor: '#FFFFFF',
                      marginBottom: 5,
                    }}
                  >
                  </View>
                </View>
              </ImageBackground>
              <ImageBackground
                source={require('../../../assets/Rectangle2.png')}
                style={[
                  styles.circleBackground2,
                  {
                    width: isTablet ? wp('33%') : wp('34%'),
                    height: isTablet ? hp('31%') : hp('22%'),
                  }
                ]}
                resizeMode="cover">
                <View style={{ alignItems: 'flex-start', marginLeft: isTablet ? 20 : 5, marginTop: isTablet ? 10 : 7, }}>
                  <Text style={[styles.targetTextTitle, { marginLeft: isTablet ? wp('3%') : wp('0.5%'), }]}>Collection Target</Text>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={[styles.targetTextValue, isTablet && { marginLeft: wp('3%') }]}>₹</Text>
                    <Text style={styles.targetTextValue}>50,00,000</Text>
                  </View>
                  <View style={{ flexDirection: "row", marginBottom: 10 }}>
                    <Text style={[styles.targetText, isTablet && { marginLeft: wp('3%') }]}>Collected{" "}</Text>
                    <Text style={styles.targetText1}>₹{" "}</Text>
                    <Text style={styles.targetText2}>28,00,000</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'center', width: '100%', marginBottom: 5, marginTop: 8 }}>
                  <View
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 45,
                      height: 45,
                      borderRadius: 50,
                      backgroundColor: '#FFFFFF',
                      marginBottom: 5,
                    }}
                  >
                  </View>
                </View>
              </ImageBackground>

             <TouchableOpacity
  activeOpacity={0.7}
  onPress={() => navigation.navigate("Visitplanning")}
>
  <ImageBackground
    source={require('../../../assets/Rectangle3.png')}
    resizeMode="cover"
    style={[
      styles.circleBackground3,
      {
        width: isTablet ? wp('27%') : wp('27%'),
        height: isTablet ? hp('31%') : hp('22%'),
        marginLeft: isTablet ? wp('2%') : wp('1.5%'),
        marginTop: isTablet ? hp('1%') : hp('1%'),
      },
    ]}
  >
    <View
      style={{
        alignItems: 'flex-start',
        marginLeft: isTablet ? 25 : 10,
        marginTop: isTablet ? 25 : 7,
      }}
    >
      <Text
        style={[
          styles.targetTextTitleVisit,
          { marginLeft: isTablet ? wp('1%') : wp('0.5%') },
        ]}
      >
        Visit
      </Text>

      <View style={{ flexDirection: 'row', marginBottom: 5 }}>
        <Text style={[styles.targetText, isTablet && { marginLeft: wp('1%') }]}>
          Planned{' '}
        </Text>
        <Text style={styles.targetText1}>{plannedCount}</Text>
      </View>

      <View style={{ flexDirection: 'row', marginBottom: 15 }}>
        <Text style={[styles.targetText, isTablet && { marginLeft: wp('1%') }]}>
          Completed{' '}
        </Text>
        <Text style={styles.targetText1}>{completedCount}</Text>
      </View>
    </View>

    <View
      style={{
        width: '80%',
        marginTop: 10,
        marginLeft: isTablet ? wp('3%') : 10,
        marginBottom: 10,
      }}
    >
      <View
        style={{
          height: 8,
          width: '90%',
          backgroundColor: '#D9D9D9',
          borderRadius: 5,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            height: '100%',
            width: '40%',
            backgroundColor: '#57D6E2',
          }}
        />
      </View>
    </View>

    <View style={{ flexDirection: 'row', marginLeft: isTablet ? 20 : 6 }}>
      <Text
        style={[
          styles.targetTextValue,
          isTablet && { marginLeft: wp('2%') },
        ]}
      >
        ₹
      </Text>
      <Text style={styles.targetTextValue}>1,00,000</Text>
    </View>
  </ImageBackground>
</TouchableOpacity>
            </View>


            <View>
              <TouchableOpacity
                onPress={() => navigation.navigate('ProductList')}
                style={{
                  width: wp('30%'),
                  height: hp('20%'),
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#250588',
                  borderRadius: hp('1%'),
                  marginLeft: wp('2%'),
                  marginTop: hp('1%'),
                  elevation: 5,
                }}
              >
                <Text style={{
                  color: '#ffffff',
                  fontSize: hp('2%'),
                  fontWeight: '600',
                  textAlign: 'center'
                }}>
                  Product List
                </Text>
              </TouchableOpacity>

            </View>
          </ScrollView>
          <Animated.ScrollView
            onScroll={onScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 50 }}
          >

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.Visitcroll}
              contentContainerStyle={{
                flexDirection: 'row',
              }}
            >

              <View >
                <ImageBackground
                  source={require('../../../assets/Rectanglelist.png')}
                style={[
                  styles.cardBackground,
                  {
                    width: isTablet ? wp('45%') : wp('45%'),
                    height: isTablet ? hp('12%') : hp('8%'),
                    marginRight: isTablet ? wp('3%') : wp('4%'),
                  }
                ]}
                  imageStyle={styles.cardImage}
                >
                  <View style={styles.cardContent}>
                    <Image source={require('../../../assets/allList.png')} style={styles.cardIcon} resizeMode="contain" />
                    <TouchableOpacity onPress={() => navigation.navigate('OpenEnquiry')}>
                      <Text style={styles.cardLabel}>Visit</Text>
                    </TouchableOpacity>
                  </View>
                </ImageBackground>
                <View style={{ marginTop: 10 }}>
                  <ImageBackground
                    source={require('../../../assets/Rectanglelist.png')}
                     style={[
                  styles.cardBackground,
                  {
                    width: isTablet ? wp('45%') : wp('45%'),
                    height: isTablet ? hp('12%') : hp('8%'),
                    marginRight: isTablet ? wp('3%') : wp('4%'),
                  }
                ]}
                  imageStyle={styles.cardImage}
                >
                    <View style={styles.cardContent}>
                      <Image source={require('../../../assets/pendingicon.png')} style={styles.cardIcon} resizeMode="contain" />
                      <TouchableOpacity onPress={() => navigation.navigate('Deliveries')}>
                        <Text style={styles.cardLabel}>Deliveries</Text>
                      </TouchableOpacity>
                    </View>
                  </ImageBackground>
                </View>
              </View>
              <View style={{}}>
                <ImageBackground
                  source={require('../../../assets/Rectanglelist.png')}
              style={[
                  styles.cardBackground,
                  {
                    width: isTablet ? wp('45%') : wp('45%'),
                    height: isTablet ? hp('12%') : hp('8%'),
                    marginRight: isTablet ? wp('3%') : wp('4%'),
                  }
                ]}
                  imageStyle={styles.cardImage}
                >
              
                  <View style={styles.cardContent}>
                    <Image source={require('../../../assets/Approvedicon.png')} style={styles.cardIcon} resizeMode="contain" />
                    <TouchableOpacity onPress={() => navigation.navigate('ApprovedList')}>
                      <Text style={styles.cardLabel}>Approved</Text>
                    </TouchableOpacity>
                  </View>
                </ImageBackground>
                <View style={{ marginTop: 10 }}>
                  <ImageBackground
                    source={require('../../../assets/Rectanglelist.png')}
                     style={[
                  styles.cardBackground,
                  {
                    width: isTablet ? wp('45%') : wp('45%'),
                    height: isTablet ? hp('12%') : hp('8%'),
                    marginRight: isTablet ? wp('3%') : wp('4%'),
                  }
                ]}
                  imageStyle={styles.cardImage}
                >
                    <View style={styles.cardContent}>
                      <Image source={require('../../../assets/completed.png')} style={styles.cardIcon} resizeMode="contain" />
                      <TouchableOpacity onPress={() => navigation.navigate('Outstanding')}>
                        <Text style={styles.cardLabel}>Outstanding</Text>
                      </TouchableOpacity>
                    </View>
                  </ImageBackground>
                </View>
              </View>
              <View >
                <ImageBackground
                  source={require('../../../assets/Rectanglelist.png')}
                  style={[
                  styles.cardBackground,
                  {
                    width: isTablet ? wp('45%') : wp('45%'),
                    height: isTablet ? hp('12%') : hp('8%'),
                    marginRight: isTablet ? wp('3%') : wp('4%'),
                  }
                ]}
                  imageStyle={styles.cardImage}
                >
                  <View style={styles.cardContent}>
                    <Image source={require('../../../assets/completed.png')} style={styles.cardIcon} resizeMode="contain" />
                    <TouchableOpacity >
                      <Text style={styles.cardLabel}>Empty</Text>
                    </TouchableOpacity>
                  </View>
                </ImageBackground>
                <View style={{ marginTop: 10 }}>
                  <ImageBackground
                    source={require('../../../assets/Rectanglelist.png')}
                    style={[
                  styles.cardBackground,
                  {
                    width: isTablet ? wp('45%') : wp('45%'),
                    height: isTablet ? hp('12%') : hp('8%'),
                    marginRight: isTablet ? wp('3%') : wp('4%'),
                  }
                ]}
                  imageStyle={styles.cardImage}
                >
                    <View style={styles.cardContent}>
                      <Image source={require('../../../assets/saleorder.png')} style={styles.cardIcon} resizeMode="contain" />
                      <TouchableOpacity>
                        <Text style={styles.cardLabel}>Empty</Text>
                      </TouchableOpacity>
                    </View>
                  </ImageBackground>
                </View>
              </View>
            </ScrollView>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              onScroll={handleHorizontalScroll}
              scrollEventThrottle={16}
              contentContainerStyle={{ flexDirection: 'row', }}
            >
              <View>
                <View style={{ flexDirection: 'row', marginTop: 20, backgroundColor: 'transparent' }}>
                  <ImageBackground
                    source={require('../../../assets/Chartbg.png')}
                    style={[styles.chartContainer, { width: chartWidth, height: chartHeight }]}
                    imageStyle={{ borderRadius: hp('1%') }}
                  >
                    <Text style={[styles.ChartText1, { alignSelf: 'flex-start', marginLeft: wp('2%') }]}>Sales</Text>
                    <BarChartSolid
                      data={[30, 45, 28, 80, 99, 43, 50]}
                      height={chartHeight * 0.5}
                      color="#0C439E"
                    />
                    <Text style={[styles.ChartText2, { alignSelf: 'flex-start', marginLeft: wp('2%') }]}>80 MT</Text>
                  </ImageBackground>
                  <ImageBackground
                    source={require('../../../assets/Chartbg.png')}
                    style={[styles.chartContainer, { width: chartWidth, height: chartHeight }]}
                    imageStyle={{ borderRadius: hp('1%') }}
                  >
                    <Text style={[styles.ChartText1, { alignSelf: 'flex-start', marginLeft: wp('2%') }]}>Collections</Text>
                    <LineChart
                      transparent={true}
                      data={{
                        labels: [],
                        datasets: [{ data: [20, 40, 35, 60, 55, 40, 70, 60, 50] }],
                      }}
                      width={chartWidth * 0.9}
                      height={chartHeight * 0.5}
                      fromZero
                      withDots={false}
                      withShadow={false}
                      withInnerLines={false}
                      withHorizontalLabels={false}
                      withVerticalLabels={false}
                      chartConfig={{
                        backgroundColor: 'transparent',
                        backgroundGradientFrom: 'transparent',
                        backgroundGradientTo: 'transparent',
                        fillShadowGradient: 'transparent',
                        fillShadowGradientOpacity: 0,
                        color: () => '#0C439E',
                        strokeWidth: 2,
                        propsForBackgroundLines: {
                          stroke: 'transparent',
                        },
                        propsForLabels: {
                          fill: 'transparent',
                        },
                      }}
                      bezier
                      style={{
                        backgroundColor: 'transparent',
                        transform: [{ translateX: -30 }],
                      }}
                    />
                    <Text style={[styles.ChartText2, { marginRight: '40%' }]}>₹ 1,00,000</Text>
                  </ImageBackground>

                  <ImageBackground
                    source={require('../../../assets/Chartbg.png')}
                    style={[styles.chartContainer, { width: chartWidth, height: chartHeight }]}
                    imageStyle={{ borderRadius: hp('1%') }}
                  >
                    <Text style={[styles.ChartText1, { alignSelf: 'flex-start', marginLeft: wp('2%') }]}>Sales</Text>
                    <BarChartSolid
                      data={[30, 45, 28, 80, 99, 43, 50]}
                      height={chartHeight * 0.5}
                      color="#0C439E"
                    />
                    <Text style={[styles.ChartText2, { alignSelf: 'flex-start', marginLeft: wp('2%') }]}>80 MT</Text>
                  </ImageBackground>
                </View>
              </View>
            </ScrollView>
          </Animated.ScrollView>
        </View>
      </Animated.ScrollView>
    </ImageBackground>
  );
}

export default Screens;
const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
  },
  container: {
    marginTop: wp('5%'),
  },
  greeting: {
    fontFamily: 'Inter-Bold',
    fontSize: hp('3%'),
    color: '#DDDFE6',
    fontWeight: 'bold',
    marginLeft: wp('3%'),
  },
  dateText: {
    fontFamily: 'Inter-Regular',
    fontSize: hp('3%'),
    color: '#DDDFE6',
    marginTop: hp('0.5%'),
    marginLeft: wp('3%'),
  },
  circleBackground1: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginLeft: wp('3%'),
    marginTop: hp('1%'),
  },
  circleBackground2: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginLeft: wp('2%'),
    marginTop: hp('1%'),
  },
  circleBackground3: {
    width: wp('27%'),
    height: hp('22%'),
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  targetText: {
    fontFamily: 'Inter-Regular',
    fontSize: hp('1.4%'),
    color: '#f4f4f5ff',
    marginTop: hp('0.4%'),
  },
  targetTextTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: hp('1.8%'),
    color: '#f4f4f5ff',
    fontWeight: 'bold',
  },
  targetTextTitleVisit: {
    fontFamily: 'Inter-Bold',
    fontSize: hp('1.8%'),
    color: '#f4f4f5ff',
    fontWeight: 'bold',
    marginLeft: wp('0.5%'),
    marginBottom: hp('0.8%'),
  },
  targetTextValue: {
    fontFamily: 'Inter-Medium',
    fontSize: hp('2.4%'),
    color: '#f4f4f5ff',
    marginTop: hp('0.4%'),
    fontWeight: '500',
  },
  targetText1: {
    fontFamily: 'Inter-Regular',
    fontSize: hp('1.4%'),
    color: '#f4f4f5ff',
    marginTop: hp('0.4%'),
  },
  targetText2: {
    fontFamily: 'Inter-Regular',
    fontSize: hp('1.4%'),
    color: '#f4f4f5ff',
    marginTop: hp('0.4%'),
  },
  ChartText1: {
    fontFamily: 'Inter-SemiBold',
    fontSize: hp('2%'),
    color: '#ffffff',
    marginTop: hp('0.3%'),
    fontWeight: '600',
  },
  ChartText2: {
    fontFamily: 'Inter-SemiBold',
    fontSize: hp('2.3%'),
    color: '#fff9f9',
    fontWeight: 'bold',
  },
  chartContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: wp('1%'),
    marginVertical: hp('1%'),
    marginLeft: hp('1.3%')
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  Visitcroll: {
    marginTop: hp('5%'),
    paddingHorizontal: wp('2%'),
    marginBottom: hp('3%'),
  },

  colorBox: {
    width: wp('18%'),
    height: hp('5%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('2%'),
    elevation: 8,
  },
  boxText: {
    color: '#250588',
    fontWeight: 'bold',
    fontSize: hp('1.5%'),
  },
  boxNumber: {
    color: '#250588',
    fontSize: hp('1.4%'),
    fontWeight: 'bold',
  },

  listSection: {
    paddingHorizontal: wp('4%'),
    marginBottom: hp('2%'),
  },
  listTitle: {
    fontSize: hp('2.2%'),
    marginBottom: hp('1%'),
    color: '#040404',
    fontWeight: '600',
  },
  listItem: {
    backgroundColor: '#250588',
    padding: hp('1%'),
    elevation: 3,
    marginBottom: hp('1%'),
    borderRadius: hp('0.5%'),
  },
  listName: {
    fontSize: hp('1.6%'),
    fontWeight: '600',
    color: '#ffffff',
  },
  listDetail: {
    fontSize: hp('1.4%'),
    color: '#ffffff',
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp('0.5%'),
    alignItems: 'center',
  },

  cardScrollContainer: {
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('1%'),
  },
  cardBackground: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImage: {
    borderRadius: hp('1%'),
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('2%'),
  },
  cardIcon: {
    width: wp('10%'),
    height: hp('5%'),
  },
  cardLabel: {
    fontSize: hp('2%'),
    color: '#FFFDFD',
    fontFamily: 'Inter',
    fontWeight: '500',
    marginLeft: wp('2%'),
  },
});
