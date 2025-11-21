import React, { useEffect, useState, useCallback,useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { postcreatevisit, postOutstanding, postCustomerList } from "../../../../redux/action";
import OpenEnquiryStyles from "../../Styles/OpenEnquiryStyles";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons"; // ensure installed

const PAGE_SIZE = 10;
const CustomerItem = React.memo(({ item }) => {
  const navigation = useNavigation();

  const status = (item.state || "").toLowerCase();

  const handlePress = () => {
    if (status === "visited" || status === "visted" || status === "lost") {
      return; 
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

const TodayFollowup = () => {
  const dispatch = useDispatch();

  const [customers, setCustomers] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const customerData = useSelector(
    (state) => state.postcreatevisitReducer.data["openEnquiryList"]
  );
  const loading = useSelector(
    (state) => state.postcreatevisitReducer.loading["openEnquiryList"]
  );

 const today = useMemo(() => {
  return new Date().toISOString().split("T")[0];
}, []);

  const fetchEnquiries = useCallback(
  (pageNumber = 0) => {
    const domain = [["followup_date", "=", today]];

    const payload = {
      jsonrpc: "2.0",
      method: "call",
      params: {
        model: "customer.visit",
        method: "search_read",
        args: [],
        kwargs: {
          domain,
          fields: [  "id",
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
              "lost_reason",
              "create_date",
              "billing_branch_id",
              "billing_type",
              "incoterm_id",
              "payment_term_id",],
          order: "id desc",
          limit: PAGE_SIZE,
          offset: pageNumber * PAGE_SIZE,
        },
      },
    };

    console.log("📦 Fetching followups for:", today);
    dispatch(postcreatevisit(payload, "openEnquiryList"));
  },
    [today]  
);

useEffect(() => {
  setPage(0);
  setHasMore(true);
  setIsFetchingMore(false);
  setCustomers([]);

  fetchEnquiries(0);

}, []);

useEffect(() => {
  if (!customerData) return;

  const updatedList = Array.isArray(customerData) ? customerData : [];

  setCustomers(prev =>
    page === 0 ? updatedList : [...prev, ...updatedList]
  );

  if (updatedList.length < PAGE_SIZE) {
    setHasMore(false);
  }

  setIsFetchingMore(false);
}, [customerData]);


  useEffect(() => {
    const domain = [["followup_date", "=", today]];

    const payload = {
      jsonrpc: "2.0",
      method: "call",
      params: {
        model: "customer.visit",
        method: "search_count",
        args: [domain],
        kwargs: {},
      },
    };

    dispatch(postCustomerList(payload, "todayFollowupCount"));
  }, [today]);

const loadMore = () => {
  if (!loading && hasMore && !isFetchingMore) {
    const nextPage = page + 1;
    setPage(nextPage);
    setIsFetchingMore(true);
    fetchEnquiries(nextPage);
  }
};


  if (loading && page === 0 && customers.length === 0) {
    return (
      <View style={OpenEnquiryStyles.loader}>
        <ActivityIndicator size="large" color="#c7c9cdff" />
        <Text style={OpenEnquiryStyles.loaderText}>Loading Customers...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {customers.length === 0 ? (
        <View style={OpenEnquiryStyles.center}>
          <Text>No customers found for today’s follow-up ({today})</Text>
        </View>
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(item, index) => `${item.id}_${index}`}
          renderItem={({ item }) => <CustomerItem item={item} />}
          contentContainerStyle={{ paddingBottom: 20 }}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews
          onEndReachedThreshold={0.5}
          onEndReached={loadMore}
          ListFooterComponent={
            isFetchingMore ? (
              <View style={{ padding: 10, alignItems: "center" }}>
                <ActivityIndicator size="small" color="#888" />
                <Text>Loading more...</Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

export default TodayFollowup;
