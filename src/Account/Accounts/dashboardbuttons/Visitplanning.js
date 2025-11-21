import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  postcreatevisit,
  postOutstanding,
  postCustomerList,
} from "../../../redux/action";

import OpenEnquiryStyles from "../Styles/OpenEnquiryStyles";
import { useNavigation } from "@react-navigation/native";

const PAGE_SIZE = 10;

/* ---------------------------------------------
    CUSTOMER ITEM (Visit Planning Card)
---------------------------------------------- */
const CustomerItem = React.memo(({ item }) => {
  const navigation = useNavigation();

  const status = (item.state || "").toLowerCase();

  const handlePress = () => {
    if (status === "visited" || status === "visted" || status === "lost") {
      return; // ❌ Not clickable
    }

    navigation.navigate("Stage1", { enquiryData: item }); // ✅ Navigate to Stage1
  };

  return (
    
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      disabled={status === "visited" || status === "visted" || status === "lost"}
      style={{ opacity: status === "visited" || status === "visted" || status === "lost" ? 0.5 : 1 }}
    >
      <View style={OpenEnquiryStyles.card}>
        <View style={OpenEnquiryStyles.row}>
          <Text style={OpenEnquiryStyles.headerText}>
            {item.partner_id?.[1] || "-"}
          </Text>
          <Text style={[OpenEnquiryStyles.headerText, { fontSize: 10 }]}>
            {item.followup_date}
          </Text>
        </View>

        <View style={OpenEnquiryStyles.miniCard}>
          <View style={OpenEnquiryStyles.row}>
            <Text style={OpenEnquiryStyles.title}>{item.name}</Text>

            <TouchableOpacity
              onPress={() => console.log("SO Pressed:", item.id, item.so_id?.[1])}
            >
              <Text
                style={[
                  OpenEnquiryStyles.title,
                  { textDecorationLine: "underline", color: "#250588" },
                ]}
              >
                {item.so_id?.[1] || "-"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={OpenEnquiryStyles.infoRow}>
            <View style={OpenEnquiryStyles.infoItem}>
              <Text style={OpenEnquiryStyles.label}>Product</Text>
              <Text style={OpenEnquiryStyles.value}>{item.product_category || "-"}</Text>
            </View>

            <View style={OpenEnquiryStyles.infoItem}>
              <Text style={OpenEnquiryStyles.label}>Brand</Text>
              <Text style={OpenEnquiryStyles.value}>{item.brand || "-"}</Text>
            </View>

            <View style={OpenEnquiryStyles.infoItem}>
              <Text style={OpenEnquiryStyles.label}>Visit</Text>
              <Text style={OpenEnquiryStyles.value}>{item.outcome_visit || "-"}</Text>
            </View>

            <View style={OpenEnquiryStyles.infoItem}>
              <Text style={OpenEnquiryStyles.label}>Status</Text>
              <Text style={OpenEnquiryStyles.value}>{item.state || "-"}</Text>
            </View>
          </View>

          <View
            style={[
              OpenEnquiryStyles.belowrow,
              { justifyContent: "space-between", alignItems: "center", paddingRight: 5 },
            ]}
          >
            <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center" }}>
              <Text style={[OpenEnquiryStyles.label, { marginRight: 5 }]}>Remarks:</Text>
              <Text style={{ fontSize: 12 }}>{item.remarks || "-"}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const SaleOrderItem = ({ item }) => (
  <View style={OpenEnquiryStyles.card}>
    <View style={OpenEnquiryStyles.row}>
      <Text style={OpenEnquiryStyles.headerText}>{item.name}</Text>
      <Text style={[OpenEnquiryStyles.headerText, { fontSize: 10 }]}>
        {item.date_order}
      </Text>
    </View>

    <View style={OpenEnquiryStyles.miniCard}>
      <Text style={OpenEnquiryStyles.title}>
        Customer: {item.partner_id?.[1] || "-"}
      </Text>

      <Text style={OpenEnquiryStyles.value}>
        Amount: ₹ {item.amount_total}
      </Text>

      <Text style={OpenEnquiryStyles.value}>
        Status: {item.state}
      </Text>
    </View>
  </View>
);

/* ---------------------------------------------
            MAIN COMPONENT
---------------------------------------------- */
const Visitplanning = ({ searchText = "" }) => {
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState("visit"); // visit | so

  const [customers, setCustomers] = useState([]);
  const [saleOrders, setSaleOrders] = useState([]);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const roleUserId = useSelector((state) => state.postauthendicationReducer.uid);
  const customerData = useSelector(
    (state) => state.postcreatevisitReducer.data["openEnquiryList"]
  );
  const soData = useSelector(
    (state) => state.postcreatevisitReducer.data["todaySOList"]
  );

  const loading = useSelector(
    (state) => state.postcreatevisitReducer.loading["openEnquiryList"]
  );

  const soLoading = useSelector(
    (state) => state.postcreatevisitReducer.loading["todaySOList"]
  );

  const today = new Date().toISOString().split("T")[0];

  /* ---------------------------------------------
      FETCH VISIT PLANNING LIST (Followups)
  ---------------------------------------------- */
  const fetchEnquiries = useCallback(
    (pageNumber = 0) => {
     const domain = [
      ["followup_date", "=", today],
      ["so_id", "=", false] 
    ];

      const payload = {
        jsonrpc: "2.0",
        method: "call",
        params: {
          model: "customer.visit",
          method: "search_read",
          args: [],
          kwargs: {
            domain,
            fields: [
              "id",
              "name",
              "partner_id",
              "state",
              "followup_date",
              "brand",
              "visit_purpose",
              "product_category",
              "required_qty",
              "remarks",
              "so_id",
              "outcome_visit",
              "creted_date"
            ],
            order: "id desc",
            limit: PAGE_SIZE,
            offset: pageNumber * PAGE_SIZE,
          },
        },
      };

      dispatch(postcreatevisit(payload, "openEnquiryList"));
    },
    [dispatch, today]
  );

  const fetchSaleOrders = () => {
    const domain = [["create_date", "=", today]];

    const payload = {
      jsonrpc: "2.0",
      method: "call",
      params: {
        model: "sale.order",
        method: "search_read",
        args: [],
        kwargs: {
          domain,
          fields: ["id", "name", "partner_id", "state", "amount_total","create_date"],
          order: "id desc",
        },
      },
    };

    dispatch(postcreatevisit(payload, "todaySOList"));
  };

  /* Initial load */
  useEffect(() => {
    if (!roleUserId) return;

    if (activeTab === "visit") {
      setPage(0);
      setCustomers([]);
      fetchEnquiries(0);
    } else {
      fetchSaleOrders();
    }
  }, [activeTab, roleUserId]);


  useEffect(() => {
    if (!customerData) return;
    const updatedList = Array.isArray(customerData) ? customerData : [];

    if (page === 0) {
      setCustomers(updatedList);
    } else {
      setCustomers((prev) => [...prev, ...updatedList]);
    }
    setIsFetchingMore(false);
  }, [customerData]);

  /* Update SO list */
  useEffect(() => {
    if (!soData) return;
    setSaleOrders(soData);
  }, [soData]);

  return (

      <ImageBackground
          source={require("../../../assets/backgroundimg.png")}
          style={OpenEnquiryStyles.background}
          resizeMode="cover"
        >
    <View style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          padding: 10,
          justifyContent: "space-between",
          marginTop:"20%",
          marginBottom:"5%"
        }}
      >
        <TouchableOpacity
          onPress={() => setActiveTab("visit")}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 5,
            backgroundColor: activeTab === "visit" ? "#250588" : "#6072C7",
            marginRight: 5,
          }}
        >
          <Text style={{ textAlign: "center", color: "#fff" }}>
            Planning
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("so")}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 5,
            backgroundColor: activeTab === "so" ? "#250588" : "#6072C7",
            marginLeft: 5,
          }}
        >
          <Text style={{ textAlign: "center", color: "#fff" }}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {/* ---------------------------------------------
                VISIT PLANNING LIST
      ---------------------------------------------- */}
      {activeTab === "visit" && (
        <FlatList
          data={customers}
          keyExtractor={(item, index) => `${item.id}_${index}`}
          renderItem={({ item }) => <CustomerItem item={item} />}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (!loading) {
              const nextPage = page + 1;
              setPage(nextPage);
              fetchEnquiries(nextPage);
            }
          }}
        />
      )}
      {activeTab === "so" && (
        <FlatList
          data={saleOrders}
          keyExtractor={(item, index) => `${item.id}_${index}`}
          renderItem={({ item }) => <SaleOrderItem item={item} />}
        />
      )}
    </View>
    </ImageBackground>
  );
};

export default Visitplanning;
