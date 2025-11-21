import React, { useEffect, useState, useCallback, useMemo } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, TextInput, ImageBackground, Pressable, BackHandler, ScrollView, Animated } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { postcreatevisit, postOutstanding, postCustomerList } from "../../../redux/action";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Modal } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import OpenEnquiryStyles from "../../Accounts/Styles/OpenEnquiryStyles";
import CustomerList from "./VisitTabs/CustomerList";
import TodayFollowup from "./VisitTabs/TodayFollowup";


const OpenEnquiry = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [userGroups, setUserGroups] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("VisitList");
  const [modalVisible, setModalVisible] = useState(false);
  const [clickedSoId, setClickedSoId] = useState(null);
  const [OutstandingId, setOutstandingId] = useState(null);
  const [soProducts, setSoProducts] = useState({});
  const [loadingProducts, setLoadingProducts] = useState({});
  const [selectedSO, setSelectedSO] = useState(null);
  const [clickedSOName, setClickedSOName] = useState(null);
  const [outstandingData, setOutstandingData] = useState([]);
  const [statusFilter, setStatusFilter] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [todayFollowupCount, setTodayFollowupCount] = useState(0);

  const PAGE_SIZE = 10;
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));
  const headerTranslate = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, -100],
    extrapolate: 'clamp',
  });


  const loadMore = () => {
    if (hasMore && !isFetchingMore) {
      setIsFetchingMore(true);
      fetchEnquiries(page + 1, selectedStatus,searchText);
      setPage(prev => prev + 1);
    }
  };


  useEffect(() => {
    let args = [];
    if (selectedStatus === "All") {
      args = [];
    } else if (selectedStatus === "Completed") {
      args = [["so_id", "!=", false]];
    } else if (selectedStatus === "Pending") {
      args = [
        "|",
        "|",
        ["state", "=", "visted"],
        ["state", "=", "none"],
        ["state", "=", "notqualified"],
      ];
    } else if (selectedStatus === "Approved") {
      args = [["state", "=", "verify"]];
    } else if (selectedStatus === "Lost") {
      args = [["state", "=", "lost"]];
    }
    const payload = {
      jsonrpc: "2.0",
      method: "call",
      params: {
        model: "customer.visit",
        method: "search_count",
        args: [args],
        kwargs: {},
      },
    };
    dispatch(postCustomerList(payload, "visitCount"));
  }, [selectedStatus, dispatch]);


  useEffect(() => {
    if (visitCountData !== undefined && visitCountData !== null) {
      setTotalCount(visitCountData);
    }
  }, [visitCountData]);


  useEffect(() => {
    if (!postcreatevisitData) return;
    setEnquiries(prev => page === 0 ? postcreatevisitData : [...prev, ...postcreatevisitData]);
    setIsFetchingMore(false);
    if (postcreatevisitData.length < PAGE_SIZE) setHasMore(false);
  }, [postcreatevisitData, page]);

useEffect(() => {
  if (activeTab === "TodayFollowup") {
    const today = new Date().toISOString().split("T")[0];

    const payload = {
      jsonrpc: "2.0",
      method: "call",
      params: {
        model: "customer.visit",
        method: "search_count",
        args: [[["followup_date", "=", today]]],
        kwargs: {},
      },
    };

    dispatch(postCustomerList(payload, "TodayFollowup"));
  }
}, [activeTab, dispatch]);



  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('TabNavigation');
        return true;
      };
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );
      return () => subscription.remove();
    }, [navigation])
  );

const fetchEnquiries = useCallback(
  (pageNumber = 0, status, searchText = "") => {
    let domain = [];
    if (status === "Approved") {
      domain = [["state", "=", "verify"], ["so_id", "=", false]];
    } else if (status === "Pending") {
      domain = [
        ["state", "in", ["visted", "none", "notqualified"]],
        ["so_id", "=", false]
      ];
    } else if (status === "Completed") {
      domain = [["so_id", "!=", false]];
    } else if (status === "Lost") {
      domain = [["state", "=", "lost"]];
    }


    // Search across multiple fields
    if (searchText && searchText.trim() !== "") {
      const search = searchText.trim();


      // List of fields to search
      const searchFields = [
        "name",
        "partner_id.name",
        "state",
        "followup_date",
        "brand",
        "visit_purpose",
        "product_category",
        "required_qty",
        "remarks",
        "so_id.name",
        "outcome_visit",
        "lost_reason",
        "create_date",
        "billing_branch_id.name",
        "billing_type",
        "incoterm_id.name",
        "payment_term_id.name",
      ];


      // Build OR chain
      let searchDomain = [];
      searchFields.forEach((field) => {
        if (searchDomain.length === 0) {
          searchDomain.push([field, "ilike", search]);
        } else {
          searchDomain = ["|", [field, "ilike", search], ...searchDomain];
        }
      });


      domain = [...domain, ...searchDomain];
    }


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
            "lost_reason",
            "create_date",
            "billing_branch_id",
            "billing_type",
            "incoterm_id",
            "payment_term_id",
          ],
          order: "id desc",
          limit: PAGE_SIZE,
          offset: pageNumber * PAGE_SIZE,
        },
      },
    };
    console.log("paylod",payload);
   
    dispatch(postcreatevisit(payload, "openEnquiryList"));
  },
  [dispatch]
);

useEffect(() => {
  if (activeTab === "VisitList") {
    fetchEnquiries(0, "All", "");
    setSelectedStatus("All");  
  }
}, [activeTab]);

  useEffect(() => {
    if (selectedSO && productsData) {
      const soData = soDetails && soDetails.length > 0 ? soDetails[0] : null;
      navigation.navigate("VisitSoBillSummary", {
        products: selectedSO.products,
        form: {
          name: soData?.name || selectedSO.so_number,
          company_id: soData?.company_id?.[1] || selectedSO.billing_branch,
          amount_untaxed: soData?.amount_untaxed || 0,
          amount_tax: soData?.amount_tax || 0,
          amount_total: soData?.amount_total || 0,
          mobile: soData?.mobile || "",
          partner_invoice_name: soData?.partner_invoice_id?.[1] || null,
          partner_shipping_name: soData?.partner_shipping_id?.[1] || null,
        },
        taxDetails: [],
      });
      setSelectedSO(null);
    }
  }, [soDetails, selectedSO, navigation]);


  const uid = useSelector((state) => state.postauthendicationReducer.uid);
  const postcreatevisitLoading = useSelector(
    (state) => state.postcreatevisitReducer.loading["openEnquiryList"]
  );
  const postcreatevisitData = useSelector(
    (state) => state.postcreatevisitReducer.data["openEnquiryList"]
  );
  const postcreatevisitGst = useSelector(
    (state) => state.postcreatevisitReducer.data["taxAmounts"]
  );
  const groupListData = useSelector(
    (state) => state.postcreatevisitReducer.data["groupList"]
  );
  const productsData = useSelector(
    (state) => state.postcreatevisitReducer.data["soProducts"]
  );
  const soDetails = useSelector(
    (state) => state.postcreatevisitReducer.data["soDetails"]
  );
  const outstandingInvoicesData = useSelector(
    (state) => state.postOutstandingReducer.data["outstandingInvoices"]
  );
  const customerData = useSelector(
    (state) => state.postcreatevisitReducer.data["customerList"]
  );
  const visitCountData = useSelector(
    (state) => state.postCustomerListReducer.data["visitCount"]
  );
  const customerCountData = useSelector(
    (state) => state.postCustomerListReducer.data["customerCount"]
  );
  const roleUserId = useSelector(
    (state) => state.postauthendicationReducer.uid
  );
 const TodayFollowupData = useSelector(
    (state) => state.postCustomerListReducer.data["TodayFollowup"]
  );
const customers = customerData ?? [];

    const today = new Date().toISOString().split("T")[0]; 

  const fetchOutstanding = useCallback(() => {
    const payload = {
      jsonrpc: "2.0",
      method: "call",
      params: {
        model: "account.move",
        method: "search_read",
        args: [
          [
            ["move_type", "=", "out_invoice"],
            ["state", "=", "posted"],
            ["payment_state", "!=", "paid"]
          ]
        ],
        kwargs: {
          fields: ["id", "name", "missed_days", "amount_residual", "partner_id"],
        },
      },
    };
    dispatch(postOutstanding(payload, "outstandingInvoices"));
  }, [dispatch]);


  const fetchTaxAmount = useCallback(
    async (taxIds) => {
      if (!taxIds || taxIds.length === 0) return [];
      const payload = {
        jsonrpc: "2.0",
        method: "call",
        params: {
          model: "account.tax",
          method: "search_read",
          args: [[["id", "in", taxIds]]],
          kwargs: {
            fields: ["id", "name", "amount"],
          },
        },
      };
      try {
        const res = await dispatch(postcreatevisit(payload, "taxAmounts"));
        return res?.data || [];
      } catch (err) {
        return [];
      }
    },
    [dispatch]
  );


  useEffect(() => {
    if (activeTab === "CustomerList" && roleUserId) {
      const payload = {
        jsonrpc: "2.0",
        method: "call",
        params: {
          model: "res.partner",
          method: "search_count",
          args: [[["user_id", "=", roleUserId]]],
          kwargs: {},
        },
      };
      dispatch(postCustomerList(payload, "customerCount"));
    }
  }, [activeTab, dispatch, roleUserId]);


  useEffect(() => {
    setPage(0);
    setHasMore(true);
    setEnquiries([]);
    fetchEnquiries(0, selectedStatus,searchText);
  }, [selectedStatus, searchText]);


  useEffect(() => {
    fetchOutstanding();
  }, []);


  const getOutstanding = useCallback(
    (partnerId) => {
      if (!Array.isArray(outstandingInvoicesData)) return 0;
      return outstandingInvoicesData
        .filter(a => Array.isArray(a.partner_id) && a.partner_id[1] === partnerId)
        .reduce((sum, dta) => sum + (dta.amount_residual || 0), 0);
    },
    [outstandingInvoicesData]
  );


  const handleOutstandingPress = useCallback(
    (partnerName) => {
      if (!Array.isArray(outstandingInvoicesData)) {
        return;
      }
      const data = outstandingInvoicesData.filter(
        (a) =>
          Array.isArray(a.partner_id) && a.partner_id[1] === partnerName
      );
      setOutstandingId((prev) => {
        const newId = prev === partnerName ? null : partnerName;
        return newId;
      });
      setOutstandingData(data);
    },
    [outstandingInvoicesData]
  );




  useEffect(() => {
    if (soDetails) {
      if (Array.isArray(soDetails) && soDetails.length > 0) {
      }
    }
  }, [soDetails]);


  useEffect(() => {
    if (!clickedSOName || !soDetails) return;
    const soData = Array.isArray(soDetails) && soDetails.length > 0 ? soDetails[0] : null;
    if (!soData) return;
    const item = enquiries.find(e => e.so_number === clickedSOName);
    if (!item) return;
    setSelectedSO({
      ...item,
      soDetails: soData,
      products: item.products,
    });
    setClickedSOName(null);
  }, [soDetails, clickedSOName, enquiries]);


  useEffect(() => {
    if (!productsData) return;
    const groupedProducts = {};
    const dataArray = Array.isArray(productsData) ? productsData : Object.values(productsData);
    dataArray.forEach((prod) => {
      const soId = Array.isArray(prod.order_id) ? String(prod.order_id[0]) : String(prod.order_id);
      if (!groupedProducts[soId]) groupedProducts[soId] = [];
      groupedProducts[soId].push(prod);
    });
    setSoProducts(groupedProducts);
    setLoadingProducts({});
  }, [productsData]);


  useEffect(() => {
    if (Array.isArray(groupListData) && groupListData.length > 0) {
      const extractedGroupIds = (groupListData[0].groups_id || []).map((g) =>
        Array.isArray(g) ? g[0] : g
      );
      setUserGroups(extractedGroupIds);
    }
  }, [groupListData]);


  const formatDateTime = (dateStr) => {
    if (!dateStr) return "N/A";
    const isoStr = dateStr.replace(" ", "T");
    const dateObj = new Date(isoStr);
    if (isNaN(dateObj.getTime())) return "N/A";
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    let hours = dateObj.getHours();
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const strHours = String(hours).padStart(2, "0");
    return `${day}/${month}/${year} ${strHours}:${minutes} ${ampm}`;
  };


  useEffect(() => {
    if (!clickedSoId) return;
    const soData = soProducts[clickedSoId];
    if (soData) {
      setEnquiries(prev =>
        prev.map(item =>
          item.id === clickedSoId ? { ...item, products: soData } : item
        )
      );
      setLoadingProducts(prev => ({ ...prev, [clickedSoId]: false }));
    }
  }, [soProducts, clickedSoId]);


  useEffect(() => {
    if (postcreatevisitData) {
      setButtonLoading(false);
    }
  }, [postcreatevisitData]);


  useEffect(() => {
    const normalizeDataWithTax = async () => {
      if (!Array.isArray(postcreatevisitData)) return;
      const allTaxIds = postcreatevisitData.flatMap(item =>
        (soProducts[String(Array.isArray(item.so_id) ? item.so_id[0] : item.so_id)] || []).flatMap(prod =>
          Array.isArray(prod.tax_id) ? prod.tax_id.map(t => Array.isArray(t) ? t[0] : t) : []
        )
      );
      const taxDetails = await fetchTaxAmount([...new Set(allTaxIds)]);
      const normalizedData = postcreatevisitData.map(item => {
        const soId = Array.isArray(item.so_id) ? String(item.so_id[0]) : String(item.so_id);
        const products = (soProducts[soId] || []).map(prod => {
          const prodTaxIds = Array.isArray(prod.tax_id) ? prod.tax_id.map(t => Array.isArray(t) ? t[0] : t) : [];
          const tax_amount = prodTaxIds.reduce((sum, tId) => {
            const tax = taxDetails.find(t => t.id === tId);
            return sum + (prod.price_subtotal * (tax?.amount || 0)) / 100;
          }, 0);


          return {
            id: prod.id,
            name: prod.name,
            qty: prod.product_uom_qty,
            price: prod.price_unit,
            subtotal: prod.price_subtotal,
            qty_delivered: prod.qty_delivered,
            tax_id: prodTaxIds,
            tax_amount,
            total_with_tax: prod.price_subtotal + tax_amount,
          };
        });
        return {
          id: item.id,
          reference: item.name || "N/A",
          purpose_of_visit: item.visit_purpose || " ",
          customer_name:
            Array.isArray(item.partner_id) && item.partner_id[1]
              ? item.partner_id[1]
              : " ",
          brand:
            Array.isArray(item.brand) && item.brand[1] ? item.brand[1] : " ",
          outcome_visit:
            Array.isArray(item.outcome_visit) && item.outcome_visit[1]
              ? item.outcome_visit[1]
              : item.outcome_visit || " ",
          product_category:
            Array.isArray(item.product_category) && item.product_category[1]
              ? item.product_category[1]
              : item.product_category || " ",
          qty: item.required_qty ?? " ",
          remarks: item.remarks || " ",
          so_number:
            Array.isArray(item.so_id) && item.so_id[1] ? item.so_id[1] : " ",
          state: item.state || "N/A",
          billing_branch:
            Array.isArray(item.billing_branch_id) && item.billing_branch_id[1]
              ? item.billing_branch_id[1]
              : "-",
          billing_type: item.billing_type || "-",
          incoterm:
            Array.isArray(item.incoterm_id) && item.incoterm_id[1]
              ? item.incoterm_id[1]
              : "-",
          payment_term:
            Array.isArray(item.payment_term_id) && item.payment_term_id[1]
              ? item.payment_term_id[1]
              : "-",
          followup_date: item.followup_date
            ? new Date(item.followup_date).toLocaleDateString()
            : "Not Scheduled",
          create_date: formatDateTime(item.create_date),
          products,
        };
      });
      setEnquiries(prev => (page === 0 ? normalizedData : [...prev, ...normalizedData]));
    };
    normalizeDataWithTax();
  }, [postcreatevisitData, soProducts, fetchTaxAmount]);


  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((item) => {
      const text = searchText.toLowerCase();
      const matchesSearch =
        (item.customer_name || "").toString().toLowerCase().includes(text) ||
        (item.state || "").toString().toLowerCase().includes(text) ||
        (item.followup_date || "").toString().toLowerCase().includes(text) ||
        (item.purpose_of_visit || "").toString().toLowerCase().includes(text) ||
        (item.outcome_visit || "").toString().toLowerCase().includes(text) ||
        (item.brand || "").toString().toLowerCase().includes(text) ||
        (item.product_category || "").toString().toLowerCase().includes(text) ||
        (item.so_number || "").toString().toLowerCase().includes(text) ||
        (item.reference || "").toString().toLowerCase().includes(text);
      let matchesFilter = true;
      if (statusFilter === "Approved") {
        matchesFilter = (item.state || "").toLowerCase() === "verify";
      } else if (statusFilter === "Lost") {
        matchesFilter = (item.state || "").toLowerCase() === "lost";
      } else if (statusFilter === "Completed") {
        matchesFilter = item.so_number && item.so_number.trim() !== "-";
      } else if (statusFilter === "Pending") {
        matchesFilter = ["none", "notqualified", "visted"].includes(
          (item.state || "").toLowerCase()
        );
      }
      return matchesSearch && matchesFilter;
    });
  }, [enquiries, searchText, statusFilter]);

const filteredCustomers = useMemo(() => {
  const text = (searchText ?? "").toLowerCase();

  return customers.filter((item) => {
    const name = String(item.name ?? "").toLowerCase();
    const phone = String(item.phone ?? "").toLowerCase();
    const mobile = String(item.mobile ?? "").toLowerCase();
    const email = String(item.email ?? "").toLowerCase();
    const city = String(item.city ?? "").toLowerCase();
    const state = Array.isArray(item.state_id)
      ? String(item.state_id[1] ?? "").toLowerCase()
      : "";

    return (
      name.includes(text) ||
      phone.includes(text) ||
      mobile.includes(text) ||
      email.includes(text) ||
      city.includes(text) ||
      state.includes(text)
    );
  });
}, [customers, searchText]);


  const renderItem = ({ item }) => {
    const status = (item.state || "").toString().trim().toLowerCase();
    const soIdNum = Array.isArray(item.so_id) ? item.so_id[0] : item.so_id;
    const handleSoPress = (itemId, soNumber) => {
      if (clickedSoId === itemId) {
        setClickedSoId(null);
      } else {
        setClickedSoId(itemId);
        setLoadingProducts(prev => ({ ...prev, [itemId]: true }));
        const payload = {
          jsonrpc: "2.0",
          method: "call",
          params: {
            model: "sale.order.line",
            method: "search_read",
            args: [],
            kwargs: {
              domain: [["order_id", "=", soNumber]],
              fields: [
                "id",
                "name",
                "product_template_id",
                "product_uom_qty",
                "qty_delivered",
                "qty_invoiced",
                "price_unit",
                "tax_id",
                "price_subtotal",
                "order_id",
              ],
            },
          },
        };
        dispatch(postcreatevisit(payload, "soProducts"));
      }
    };


    const handlePress = () => {
      if (status === "visited" || status === "visted" || status === "lost") return;
      navigation.navigate("Stage1", { enquiryData: item });
    };


    const handleProductPress = (item) => {
      const soName = item.so_number;
      if (!soName || soName.trim() === "-") return;
      setClickedSOName(soName);
      const payload = {
        jsonrpc: "2.0",
        method: "call",
        params: {
          model: "sale.order",
          method: "search_read",
          args: [],
          kwargs: {
            domain: [["name", "=", soName]],
            fields: [
              "id",
              "name",
              "company_id",
              "mobile",
              "partner_invoice_id",
              "partner_shipping_id",
              "billing_branch_id",
              "amount_untaxed",
              "amount_tax",
              "amount_total",
              "order_line",
            ],
          },
        },
      };
      dispatch(postcreatevisit(payload, "soDetails"));
    };
    const OutstandingCard = React.memo(({ data }) => {
      if (!data || data.length === 0) return null;
      return (
        <View style={OpenEnquiryStyles.summaryCard}>
          <View style={OpenEnquiryStyles.summaryHeader}>
            <View style={{ flexDirection: "row", alignItems: "center", }}>
              <Icon name="book" size={20} color="#24bc99" style={{ marginRight: 8 }} />
              <Text style={OpenEnquiryStyles.summaryHeaderText}>Invoice List</Text>
            </View>
          </View>
          <View style={OpenEnquiryStyles.summaryRow}>
            <View style={OpenEnquiryStyles.summaryItem}>
              <Text style={OpenEnquiryStyles.summaryLabel}>Invoice</Text>
            </View>
            <View style={OpenEnquiryStyles.summaryItem}>
              <Text style={OpenEnquiryStyles.summaryLabel}>Missed Days</Text>
            </View>
            <View style={OpenEnquiryStyles.summaryItem}>
              <Text style={OpenEnquiryStyles.summaryLabel}>Outstanding</Text>
            </View>
          </View>
          {data.map((a) => (
            <TouchableOpacity
              key={a.id || a.name}
              onPress={() =>
                navigation.navigate("InvoiceDetails", {
                  invoiceId: a.id,
                  invoiceName: a.name,
                })
              }
              style={[
                OpenEnquiryStyles.summaryRow,
                { backgroundColor: "transparent", borderRadius: 8, marginBottom: 6 },
              ]}
            >
              <View style={OpenEnquiryStyles.summaryItem}>
                <Text style={OpenEnquiryStyles.summaryValue}>{a.name}</Text>
              </View>
              <View style={OpenEnquiryStyles.summaryItem}>
                <Text style={OpenEnquiryStyles.summaryValue}>{a.missed_days}</Text>
              </View>
              <View style={OpenEnquiryStyles.summaryItem}>
                <Text style={OpenEnquiryStyles.summaryValue}>{a.amount_residual}</Text>
              </View>
            </TouchableOpacity>
          ))}


        </View>
      );
    });
    return (
      <View>
        <View style={OpenEnquiryStyles.card}>
          <View style={OpenEnquiryStyles.row}>
            <Text style={OpenEnquiryStyles.headerText}>{item.customer_name}</Text>
            <Text style={[OpenEnquiryStyles.headerText, { fontSize: 9 }]}>{item.followup_date}</Text>
          </View>
          {getOutstanding(item.customer_name) > 0 && (
            <TouchableOpacity
              onPress={() => handleOutstandingPress(item.customer_name)}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 5 }}>
                <Text style={OpenEnquiryStyles.OutstangingLabel}>OS:</Text>
                <Text style={OpenEnquiryStyles.OutstangingValue}>
                  {getOutstanding(item.customer_name)}
                </Text>
              </View>
            </TouchableOpacity>


          )}
          <View>
          </View>
          <View style={OpenEnquiryStyles.miniCard}>
            <View style={OpenEnquiryStyles.row}>
              <Text style={OpenEnquiryStyles.title}>{item.reference}</Text>
              <TouchableOpacity onPress={() => handleSoPress(item.id, item.so_number)}>
                <Text style={[OpenEnquiryStyles.title, { textDecorationLine: "underline", color: "#250588" }]}>
                  {item.so_number}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={OpenEnquiryStyles.infoRow}>
              <View style={OpenEnquiryStyles.infoItem}>
                <Text style={OpenEnquiryStyles.label}>Product</Text>
                <Text style={OpenEnquiryStyles.value}>{item.product_category}</Text>
              </View>
              <View style={OpenEnquiryStyles.infoItem}>
                <Text style={OpenEnquiryStyles.label}>Brand</Text>
                <Text style={OpenEnquiryStyles.value}>{item.brand}</Text>
              </View>
              <View style={OpenEnquiryStyles.infoItem}>
                <Text style={OpenEnquiryStyles.label}>Visit</Text>
                <Text style={OpenEnquiryStyles.value}>{item.outcome_visit}</Text>
              </View>
              <View style={OpenEnquiryStyles.infoItem}>
                <Text style={OpenEnquiryStyles.label}>Status</Text>
                <Text style={OpenEnquiryStyles.value}>{item.state}</Text>
              </View>
            </View>
            <View style={[OpenEnquiryStyles.belowrow, { justifyContent: 'space-between', alignItems: 'center', paddingRight: 5 }]}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                <Text style={[OpenEnquiryStyles.label, { marginRight: 5 }]}>Remarks:</Text>
                <Text style={{ fontSize: 12 }}>{item.remarks}</Text>
              </View>
              {!["visited", "visted", "lost", "enquiry"].includes(status) && (
                <TouchableOpacity onPress={handlePress}>
                  <Icon name="chevron-right" size={20} color="#250588" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
        {clickedSoId === item.id &&
          item.so_number &&
          item.so_number.trim() !== "-" &&
          item.so_number.trim() !== "" && (
            <View style={OpenEnquiryStyles.extraContainer}>
              <View style={OpenEnquiryStyles.extraRowBelow}>
                <View style={OpenEnquiryStyles.extraItem}>
                  <Text style={OpenEnquiryStyles.extraLabel}>Billing Type</Text>
                  <Text style={OpenEnquiryStyles.extraValue}>{item.billing_type || "-"}</Text>
                </View>
                <View style={OpenEnquiryStyles.extraItem}>
                  <Text style={OpenEnquiryStyles.extraLabel}>Billing Branch</Text>
                  <Text style={OpenEnquiryStyles.extraValue}>{item.billing_branch || "-"}</Text>
                </View>
                <View style={OpenEnquiryStyles.extraItem}>
                  <Text style={OpenEnquiryStyles.extraLabel}>Incoterm</Text>
                  <Text style={OpenEnquiryStyles.extraValue}>{item.incoterm || "-"}</Text>
                </View>
              </View>
              <View style={OpenEnquiryStyles.extraRowBelow}>
                <View style={OpenEnquiryStyles.extraItem1}>
                  <Text style={OpenEnquiryStyles.extraLabel}>Payment Terms</Text>
                  <Text style={OpenEnquiryStyles.extraValue}>{item.payment_term || "-"}</Text>
                </View>
              </View>
              {loadingProducts[item.id] ? (
                <ActivityIndicator
                  size="small"
                  color="#24bc99"
                  style={{ marginVertical: 10 }}
                />
              ) : (
                item.products &&
                item.products.length > 0 && (
                  <View style={OpenEnquiryStyles.summaryCard}>
                    <View style={OpenEnquiryStyles.summaryHeader}>
                      <Icon
                        name="book"
                        size={20}
                        color="#24bc99"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={OpenEnquiryStyles.summaryHeaderText}>Product List</Text>


                    </View>
                    {item.products.map((prod) => (
                      <View key={prod.id} style={OpenEnquiryStyles.infoRow}>
                        <Text style={OpenEnquiryStyles.productName}>{prod.name}</Text>
                        <Text style={OpenEnquiryStyles.productvalue}>{prod.qty}</Text>
                      </View>
                    ))}
                    <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                      <TouchableOpacity
                        onPress={() => handleProductPress(item)}
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Text style={OpenEnquiryStyles.viewproduct}>View Details</Text>
                        <Icon name="chevron-right" size={20} color="#250588" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )
              )}
            </View>
          )}
        {OutstandingId === item.customer_name && (
          <OutstandingCard data={outstandingData} />
        )}
      </View>
    )
  };


  return (
    <ImageBackground
      source={require("../../../assets/backgroundimg.png")}
      style={OpenEnquiryStyles.background}
      resizeMode="cover"
    >
      <View style={OpenEnquiryStyles.container}>
        <View style={OpenEnquiryStyles.tabsContainer}>
          {["CustomerList", "VisitList", "TodayFollowup"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                OpenEnquiryStyles.tab,
                activeTab === tab && OpenEnquiryStyles.activeTab,
              ]}
              onPress={() => setActiveTab(tab)}>
              <Text
                style={[
                  OpenEnquiryStyles.tabText,
                  activeTab === tab && OpenEnquiryStyles.activeTabText,
                ]}>
                {tab === "CustomerList" ? "Customer List" : tab === "VisitList" ? "Visit List" : "Today Followup"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={OpenEnquiryStyles.searchRow}>
          <TextInput
            style={OpenEnquiryStyles.searchInput}
            placeholder="Search"
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity
            style={OpenEnquiryStyles.plusButton}
            onPress={() => setModalVisible(true)}
          >
            <Icon name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      {/* <Text style={OpenEnquiryStyles.totalCountTextlabel}>
  Total List:{" "}
  <Text style={OpenEnquiryStyles.totalCountTextValue}>
    {activeTab === "CustomerList"
      ? customerCountData
      : activeTab === "VisitList"
      ? visitCountData
      : todayFollowupCount}
  </Text>
        </Text> */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={OpenEnquiryStyles.modalContainer}>
            <View style={OpenEnquiryStyles.modalContent}>
              <Pressable
                style={OpenEnquiryStyles.modalcard}
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate("CreateVisit");
                }}
              >
                <Text style={OpenEnquiryStyles.cardText}>Create Visit</Text>
              </Pressable>
              <Pressable
                style={OpenEnquiryStyles.modalcard}
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate("CreateCustomer");
                }}
              >
                <Text style={OpenEnquiryStyles.cardText}>Create Customer</Text>
              </Pressable>
              <TouchableOpacity
                style={OpenEnquiryStyles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: "#fff" }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>


        <View style={{ flex: 1 }}>
          {activeTab === "VisitList" ? (
            postcreatevisitLoading ? (
              <View style={OpenEnquiryStyles.loader}>
                <ActivityIndicator size="large" color="#3966c2" />
                <Text style={OpenEnquiryStyles.loaderText}>
                  Loading Enquiries...
                </Text>
              </View>
            ) : (
              <View style={{ marginBottom: 20 }}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 10, marginTop: 0 }}
                >
                  {["Approved", "Pending", "Completed", "Lost", "All"].map(
                    (btn, index) => {
                      const isActive = selectedStatus === btn;
                      return (
                        <TouchableOpacity
                          key={index}
                          style={{
                            backgroundColor: isActive ? "#250588" : "#6072C7",
                            paddingVertical: 10,
                            paddingHorizontal: 15,
                            borderRadius: 8,
                            marginRight: 12,
                            justifyContent: "center",
                            alignItems: "center",
                            marginBottom: 10,
                          }}
                          onPress={() => {
                            setSelectedStatus(btn);
                            setButtonLoading(true);
                            fetchEnquiries(btn);
                          }}
                        >
                          <Text
                            style={{
                              color: "#fff",
                              fontWeight: "bold",
                              textAlign: "center",
                            }}
                          >
                            {btn}
                          </Text>
                        </TouchableOpacity>
                      );
                    }
                  )}
                </ScrollView>
                {filteredEnquiries.length > 0 ? (
                  <FlatList
                    data={filteredEnquiries.filter(
                      (v, i, a) => v.id && a.findIndex(t => t.id === v.id) === i)}
                    keyExtractor={(item, index) => item.id ? String(item.id) : `enquiry-${index}`}
                    renderItem={renderItem}
                    contentContainerStyle={{ flexGrow: 1, paddingTop: 10, paddingBottom: "110%", }}
                    showsVerticalScrollIndicator={true}
                    keyboardShouldPersistTaps="handled"
                    removeClippedSubviews={false}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={10}
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
                ) : (
                  <View style={OpenEnquiryStyles.center}>
                    <Text>No enquiries available</Text>
                    <Text>{filteredEnquiries}</Text>
                  </View>
                )}
              </View>
            )
          ) : activeTab === "CustomerList" ? (
       <CustomerList
  customers={customers}
  searchText={searchText}
/>
          ) : (

  <TodayFollowup searchText={filteredCustomers} />        
          )}
        </View>
      </View>
    </ImageBackground>
  );
};
export default OpenEnquiry;