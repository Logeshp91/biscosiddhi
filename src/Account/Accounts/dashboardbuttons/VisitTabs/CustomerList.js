import React, { useEffect, useState, useCallback, useMemo } from "react";
import { View, Text, FlatList, ActivityIndicator,TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { postcreatevisit, postOutstanding } from "../../../../redux/action";
import OpenEnquiryStyles from "../../Styles/OpenEnquiryStyles";
import { useNavigation } from "@react-navigation/native";

const CustomerItem = React.memo(({ item }) => {
  const stateName = Array.isArray(item.state_id) ? item.state_id[1] : "-";
    const navigation = useNavigation();
    const handleInvoiceRowPress = (invoice) => {
    console.log("Navigate with invoice ID:", invoice.id);
 navigation.navigate("InvoiceDetails", { invoiceId: invoice.id });
  };
  return (
    <View style={OpenEnquiryStyles.card}>
      <Text style={OpenEnquiryStyles.headerText}>
        {item.complete_name ?? "-"}
      </Text>

      <View style={OpenEnquiryStyles.miniCard}>
        <View
          style={{
            flexDirection: "row",
            marginVertical: 2,
            justifyContent: "space-between",
          }}
        >
          <Text>
            <Text style={OpenEnquiryStyles.label}>Phone: </Text>
            <Text style={OpenEnquiryStyles.value}>{item.phone ?? "-"}</Text>
          </Text>
          <Text>
            <Text style={OpenEnquiryStyles.label}>Mobile: </Text>
            <Text style={OpenEnquiryStyles.value}>{item.mobile ?? "-"}</Text>
          </Text>
        </View>

        <Text style={{ marginVertical: 2 }}>
          <Text style={OpenEnquiryStyles.label}>Street: </Text>
          <Text style={OpenEnquiryStyles.value}>{item.street ?? "-"}</Text>
        </Text>

        <Text style={{ marginVertical: 2 }}>
          <Text style={OpenEnquiryStyles.label}>City: </Text>
          <Text style={OpenEnquiryStyles.value}>{item.city ?? "-"}</Text>
        </Text>

        <Text style={{ marginVertical: 2 }}>
          <Text style={OpenEnquiryStyles.label}>State: </Text>
          <Text style={OpenEnquiryStyles.value}>{stateName}</Text>
        </Text>

        <Text style={{ marginVertical: 4 }}>
          <Text style={OpenEnquiryStyles.label}>Outstanding: </Text>
          <Text
            style={[
              OpenEnquiryStyles.value,
              { color: "#c0392b", fontWeight: "600" },
            ]}
          >
            ₹{item.outstanding_amount ?? "0.00"}
          </Text>
        </Text>
        {item.invoice_details && item.invoice_details.length > 0 && (
          <>
            <Text
              style={{
                marginVertical: 4,
                fontWeight: "600",
                color: "#34495e",
              }}
            >
              Invoice Details:
            </Text>
            {item.invoice_details.map((inv, idx) => {
              return (
                <TouchableOpacity
                  key={idx}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 4,
                    borderColor: "#ccc",
                    paddingBottom: 2,
                    marginTop:2
                  }}
                onPress={() => handleInvoiceRowPress(inv)}

                >
                  <Text style={{ flex: 1, color: "#2980b9",fontSize:12 }}>
                    {inv.name ?? "-"}
                  </Text>
                  <Text style={{ flex: 1, textAlign: "center",color: "#2980b9",fontSize:12 }}>
                    {inv.missed_days ?? "-"}
                  </Text>
                  <Text
                    style={{
                      flex: 1,
                      textAlign: "right",
                      color:  "#2980b9",
                      fontSize:12,
                    }}
                  >
                    ₹{inv.amount_total?.toFixed(2) ?? "0.00"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </View>
    </View>
  );
});

const PAGE_SIZE = 10;

const CustomerList = ({ searchText = "" }) => {
  const dispatch = useDispatch();
  
  const [customers, setCustomers] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
const roleUserId = useSelector(
  (state) => state.postauthendicationReducer.uid
);


  const customerData = useSelector(
    (state) => state.postcreatevisitReducer.data["customerList"]
  );
  const loading = useSelector(
    (state) => state.postcreatevisitReducer.loading["customerList"]
  );

useEffect(() => {
  if (!customers || customers.length === 0) return;
  const hasOutstanding = customers.every(
    (cust) => cust.outstanding_amount !== undefined
  );
  if (hasOutstanding) return; 


  const partnerIds = customers
    .filter((cust) => cust.id)
    .map((cust) => cust.id);

  if (partnerIds.length === 0) return;

  const payload = {
    jsonrpc: "2.0",
    method: "call",
    params: {
      model: "account.move",
      method: "search_read",
      args: [
        [["partner_id", "in", partnerIds]],
      ],
      kwargs: {
fields: ["id", "name", "amount_total", "amount_residual", "partner_id","missed_days"],
        limit: 1000,
      },
    },
  };

  dispatch(
    postOutstanding(payload, "outstanding_batch", (response) => {

      const invoices = Array.isArray(response?.result)
        ? response.result
        : Array.isArray(response)
        ? response
        : [];

     const grouped = invoices.reduce((acc, inv) => {
  const pid = Array.isArray(inv.partner_id)
    ? Number(inv.partner_id[0])
    : Number(inv.partner_id);
  if (!pid) return acc;
  if (!acc[pid]) acc[pid] = [];
  acc[pid].push(inv);
  return acc;
}, {});

setCustomers((prev) => {
  const merged = prev.map((cust) => {
    const invs = grouped[Number(cust.id)] || [];
    const total = invs.reduce(
      (sum, inv) => sum + (inv.amount_total || 0),
      0
    );
        return {
      ...cust,
      outstanding_amount: total.toFixed(2),
      invoice_details: invs.map((inv) => ({
        id: inv.id,
        name: inv.name,
        missed_days: inv.missed_days,
        amount_total: inv.amount_total,
        payment_state: inv.payment_state,
           })),
    };
  });
        return merged;
      });
    })
  );
}, [customers, dispatch]);

  const fetchCustomers = useCallback(
  (pageNumber = 0, searchValue = "") => {
    const domainBase = [["user_id", "=", roleUserId]];

    const domainSearch = searchValue
      ? [
          "|", "|", "|", "|",
          ["complete_name", "ilike", searchValue],
          ["phone", "ilike", searchValue],
          ["mobile", "ilike", searchValue],
          ["city", "ilike", searchValue],
         ["state_id.name", "ilike", searchValue],
        ]
      : [];

    const domain =
      domainSearch.length > 0 ? ["&", ...domainBase, ...domainSearch] : domainBase;

    const payload = {
      jsonrpc: "2.0",
      method: "call",
      params: {
        model: "res.partner",
        method: "search_read",
        args: [domain],
        kwargs: {
          fields: [
            "complete_name",
            "phone",
            "mobile",
            "street",
            "city",
            "state_id",
          ],
          limit: PAGE_SIZE,
          offset: pageNumber * PAGE_SIZE,
        },
      },
    };

    dispatch(postcreatevisit(payload, "customerList"));
  },
  [dispatch, roleUserId]
);

  useEffect(() => {
  if (!roleUserId) return; // Wait until user ID is ready
  setPage(0);
  setHasMore(true);
  setIsFetchingMore(false);
  setCustomers([]);
fetchCustomers(0, "");

}, [searchText, fetchCustomers, roleUserId]);


  useEffect(() => {
    if (!customerData) return;

    const updatedList = Array.isArray(customerData) ? customerData : [];

    if (page === 0) {
      setCustomers(updatedList);
    } else if (updatedList.length > 0) {
      setCustomers((prev) => [...prev, ...updatedList]);
    } else {
      setHasMore(false);
    }
    setIsFetchingMore(false);
  }, [customerData]);

const filteredData = useMemo(() => {
  const text = (searchText ?? "").toLowerCase();

  return customers.filter((item) => {
    const name = String(item.complete_name ?? "").toLowerCase();
    const phone = String(item.phone ?? "").toLowerCase();
    const mobile = String(item.mobile ?? "").toLowerCase();
    const city = String(item.city ?? "").toLowerCase();
    const state = Array.isArray(item.state_id)
      ? String(item.state_id[1] ?? "").toLowerCase()
      : "";

    return (
      name.includes(text) ||
      phone.includes(text) ||
      mobile.includes(text) ||
      city.includes(text) ||
      state.includes(text)
    );
  });
}, [customers, searchText]);

  // =============================
  // Load next page
  // =============================
  const loadMore = () => {
    if (!loading && hasMore && !isFetchingMore) {
      setIsFetchingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);
      fetchCustomers(nextPage, searchText);
    }
  };

  // =============================
  // Loader (initial)
  // =============================
  if (loading && page === 0 && customers.length === 0) {
    return (
      <View style={OpenEnquiryStyles.loader}>
        <ActivityIndicator size="large" color="#c7c9cdff" />
        <Text style={OpenEnquiryStyles.loaderText}>Loading Customers...</Text>
      </View>
    );
  }

  // =============================
  // Render list
  // =============================
  return (
    <View style={{ flex: 1 }}>
      {filteredData.length === 0 ? (
        <View style={OpenEnquiryStyles.center}>
          <Text>No customers found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
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

export default CustomerList;

