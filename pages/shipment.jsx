import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import axios from "axios";
import apiData from "./data.json"; // Your JSON file
import { LoginStatus } from "../globals";

const Shipment = () => {
  const [shipments, setShipments] = useState([]);
  const [sellerShipments, setSellerShipments] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState({ product: null, driver: null, device: null });

  const shipmentStatusMap = {
    SC: "Seller Created",
    DA: "Driver Approved",
    SS: "Seller Started",
    OP: "On Progress",
    DR: "Destination Reached",
    SV: "Seller Verified",
    PC: "Process Completed",
    OB: "On Bidding",
    BC: "Bidding Completed",
  };

  // Fetch shipment data
  useEffect(() => {
    const fetchShipments = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${apiData.api}/api/shipment/`);
        const allShipments = response.data;
        const filteredShipments = allShipments.filter(
          (shipment) => shipment.seller_id === LoginStatus.Data.id.toString()
        );
        setSellerShipments(filteredShipments);
      } catch (error) {
        console.error("Error fetching shipments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchShipments();
  }, [apiData.api, LoginStatus.Data.id]);

  // Fetch details of the selected shipment
  const fetchDetails = async (shipment) => {
    setLoading(true);
    try {
      const [productRes, driverRes, deviceRes] = await Promise.all([
        axios.get(`${apiData.api}/api/products/${shipment.product_id}/`),
        axios.get(`${apiData.api}/api/drivers/${shipment.driver_id}/`),
        axios.get(`${apiData.api}/api/devices/${shipment.device_id}/`),
      ]);
      setDetails({
        product: productRes.data,
        driver: driverRes.data,
        device: deviceRes.data,
      });
      setSelectedShipment(shipment);
    } catch (error) {
      console.error("Error fetching shipment details:", error);
    } finally {
      setLoading(false);
    }
  };

  const OP = async (id) => {
    const shipmentData={"status":"OP"}
    try {
      const shipmentResponse = await axios.patch(apiData.api + '/api/shipment/'+id+"/", shipmentData);
      const postShipment = shipmentResponse.data;
      setSelectedShipment(postShipment)
    } catch (error) {
      console.error('Error patching Shipment data:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!selectedShipment ? (
        <FlatList
          data={sellerShipments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => fetchDetails(item)}
            >
              <Text style={styles.cardText}>Shipment ID: {item.id}</Text>
              <Text style={styles.cardText}>Status: {shipmentStatusMap[item.status]}</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsHeader}>Shipment Details</Text>
          <Text>Shipment ID: {selectedShipment.id}</Text>
          <Text>Status: {shipmentStatusMap[selectedShipment.status]}</Text>
          <Text style={styles.detailsHeader}>Product Details</Text>
          <Text>{details.product ? ("Name : "+details.product.name) : "Loading..."}</Text>
          <Text>{details.product ? ("Details : "+details.product.details) : "Loading..."}</Text>
          <Text>{details.product ? ("Quality : "+details.product.quantity+" KG") : "Loading..."}</Text>
          <Text>{details.device ? ("Temperature : "+details.device.reading_temperature+" C") : "Loading..."}</Text>
          <Text>{details.device ? ("Humidity : "+details.device.reading_humidity+" %") : "Loading..."}</Text>
          <Text style={styles.detailsHeader}>Driver Details</Text>
          <Text>{details.driver ? ("Name : "+details.driver.name) : "Loading..."}</Text>
          <Text>{details.driver ? ("Phone : "+details.driver.phone) : "Loading..."}</Text>
          <Text>{details.driver ? ("Licence Number : "+details.driver.license_number) : "Loading..."}</Text>
          <Text>{details.driver ? ("Experience : "+details.driver.experience) : "Loading..."}</Text>
          <Text>{details.driver ? ("Driver Status : "+details.driver.status) : "Loading..."}</Text>

          {selectedShipment.status=='OP'?(
            <TouchableOpacity style={styles.bidButton} onPress={() => setSelectedShipment(null)}>
              <Text style={styles.backButtonText}>Open For Bid</Text>
            </TouchableOpacity>
          ):(
            <></>
          )}
          {selectedShipment.status=='DA'?(
            <TouchableOpacity style={styles.bidButton} onPress={() => OP(selectedShipment.id)}>
              <Text style={styles.backButtonText}>Start The Shipment</Text>
            </TouchableOpacity>
          ):(
            <></>
          )}
          
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedShipment(null)}
          >
            <Text style={styles.backButtonText}>Back to Shipments</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 3,
  },
  cardText: {
    fontSize: 16,
    color: "#333",
  },
  detailsContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 3,
  },
  detailsHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 8,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#007BFF",
    borderRadius: 8,
    alignItems: "center",
  },
  bidButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "red",
    borderRadius: 8,
    alignItems: "center",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default Shipment;
