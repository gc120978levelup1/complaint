
<script setup lang="ts">

import { Icon } from '@iconify/vue';
import { Head, /* Link, useForm, usePage */ } from '@inertiajs/vue3';
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle';
import * as L from "leaflet";
import { uid } from "uid";
import { ref, onMounted } from "vue";
import mem from '@/extra/gboi.js';

//--------------------------------------------------------------------------//
const googleLayerMap = "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}";
const initialMapZoom = 19;
const coopMainCoordinates = [11.0155, 123.9924];        // ylat, xlon format
const logo_url = ref("https://www.google.com.ph");
const spnsAddress = "JAED[";       // document title
const coopAddress = "@CEBECO II]"; // document title
const introWindowTitle = "JAED.NS for CEBECO II"     // intro duction text
//--------------------------------------------------------------------------//

const coopName = ref(null);
const loginloading = ref(false);
const loginexampleModal = ref(null);
const loginerror = ref(false);
const username = ref(null);
const password = ref(null);
const showConfirmDelete = ref(null);
const deleteAll = ref(null);
const searchList = ref([]);
const error_message = ref(null);
const loading = ref(null);
const gps = ref(null);
const gpsStuck = ref(null);
const gpsMarker = ref([]);
const rawUsersData = ref(null);
const rawCustomerData = ref(null);
const rawPrilineData = ref(null);
const rawPripoleData = ref(null);
const rawSubtranspoleData = ref(null);
const rawSubtranslineData = ref(null);
const rawSubtransXmerData = ref(null);
const rawSeclineData = ref(null);
const rawSecpoleData = ref(null);
const rawDistxmerData = ref(null);
const rawSavedCustomerFeaturesData = ref([]);
const rawSavedPrilineFeaturesData = ref([]);
const rawSavedPripoleFeaturesData = ref([]);
const rawSavedSeclineFeaturesData = ref([]);
const rawSavedSecpoleFeaturesData = ref([]);
const rawSavedDistxmerFeaturesData = ref(null);
const filteredCustomerData = ref(null);
const initialMap = ref(null);
const layer1 = ref(null);
const layer2 = ref(null);
const layer3 = ref(null);
const layer4 = ref(null);
const layer5 = ref(null);
const layer6 = ref(null);
const layer7 = ref(null);
const layer8 = ref(null);
const layer9 = ref(null);
const customerID = ref(null);

const searchHistoryModal = () => {
  deleteAll.value = "";
  showConfirmDelete.value = false;
  const myModal1 = new bootstrap.Modal(document.getElementById("searchHistoryModal")); // creating modal object
  myModal1.show();
};

const confirmClearClick = () => {
  showConfirmDelete.value = false;

  if (deleteAll.value === "delete all") {
    while (searchList.value.length > 0) {
      searchList.value.pop();
    }

    searchList.value = [];
  }
};

const clearHistoryClick = () => {
  showConfirmDelete.value = true;
};

const closeOffCanvasMenu = () => {
  const myOffCanvas = new bootstrap.Offcanvas(document.getElementById("offcanvasNavbarDark"));
  myOffCanvas.toggle();
  myOffCanvas.toggle();
};

const listOfCustomerFeatures = () => {
  rawSavedCustomerFeaturesData.value = [];

  for (let i = 0; i < rawCustomerData.value.features.length; i++) {
    rawSavedCustomerFeaturesData.value.push(rawCustomerData.value.features[i]);
  }

  filteredCustomerData.value = rawCustomerData.value;
  filteredCustomerData.value.features = [];
  let foundFeatureGeometry = null;

  for (let i = 0; i < rawSavedCustomerFeaturesData.value.length; i++) {
    var feature = rawSavedCustomerFeaturesData.value[i];
    if (feature.properties)
      if (feature.properties.JAEDType)
        if (
          feature.properties.JAEDType == "VarLoad" &&
          feature.properties.CustomerID === customerID.value
        ) {
          foundFeatureGeometry = feature.geometry;
          L.circle(
            {
              lat: foundFeatureGeometry.coordinates[1],
              lng: foundFeatureGeometry.coordinates[0],
            },
            {
              color: "yellow",
              radius: 5,
              fillColor: "steelblue",
              opacity: 0.5,
            }
          ).addTo(initialMap.value);
          var tempMarker = L.marker([
            foundFeatureGeometry.coordinates[1],
            foundFeatureGeometry.coordinates[0],
          ]).addTo(initialMap.value);
          var popup = L.popup().setContent(
            "<b>" +
            feature.properties.CustomerID +
            "</b><br>" +
            feature.properties.CustomerName +
            "<br>" +
            feature.properties.Address +
            "<br>" +
            "<a target='_blank' href='https://www.google.com/maps?q&layer=c&cbll=" +
            feature.geometry.coordinates[1] +
            "," +
            feature.geometry.coordinates[0] +
            "&cbp=0,0,0,0,0&z=18'>StreetView</a>"
          );
          tempMarker.bindPopup(popup).openPopup();
          break;
        }
  }
  if (foundFeatureGeometry) {
    for (let i = 0; i < rawSavedCustomerFeaturesData.value.length; i++) {
      feature = rawSavedCustomerFeaturesData.value[i];
      if (feature.properties)
        if (feature.properties.JAEDType)
          if (feature.properties.JAEDType == "VarLoad") {
            var x2 = feature.geometry.coordinates[0];
            var y2 = feature.geometry.coordinates[1];
            var x1 = foundFeatureGeometry.coordinates[0];
            var y1 = foundFeatureGeometry.coordinates[1];
            var distance = Math.sqrt(
              (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)
            );
            if (distance < 0.0006) {
              // approximately 50 meters
              filteredCustomerData.value.features.push(feature);
            }
          }
    }
    layer1.value = L.geoJson(filteredCustomerData.value, {
      pointToLayer: (feature, latlng) => {
        if (latlng)
          return L.circleMarker(latlng, {
            radius: 6,
            fillColor: "#ff7800",
            color: "yellow",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.9,
          });
      },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(
          "<b>" +
          feature.properties.CustomerID +
          "</b><br>" +
          feature.properties.CustomerName +
          "<br>" +
          feature.properties.Address +
          "<br>" +
          "<a target='_blank' href='https://www.google.com/maps?q&layer=c&cbll=" +
          feature.geometry.coordinates[1] +
          "," +
          feature.geometry.coordinates[0] +
          "&cbp=0,0,0,0,0&z=18'>StreetView</a>"
        );
      },
    });
    layer1.value.addTo(initialMap.value);

    rawSavedSeclineFeaturesData.value = [];
    for (let i = 0; i < rawSeclineData.value.features.length; i++) {
      rawSavedSeclineFeaturesData.value.push(rawSeclineData.value.features[i]);
    }
    rawSeclineData.value.features = [];
    for (let i = 0; i < rawSavedSeclineFeaturesData.value.length; i++) {
      feature = rawSavedSeclineFeaturesData.value[i];
      if (feature.properties)
        if (feature.properties.JAEDType)
          if (feature.properties.JAEDType == "LVLine") {
            x2 = feature.geometry.coordinates[0][0];
            y2 = feature.geometry.coordinates[0][1];
            x1 = foundFeatureGeometry.coordinates[0];
            y1 = foundFeatureGeometry.coordinates[1];
            distance = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
            if (distance < 0.006) {
              // approximately 500 meters
              rawSeclineData.value.features.push(feature);
            }
          }
    }
    layer5.value = L.geoJson(rawSeclineData.value, {
      style: {
        color: "#ff1144",
        weight: 3,
        opacity: 0.65,
      },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(
          "<b>" +
          feature.properties.PhaseCondSize +
          " " +
          feature.properties.PhaseCondType +
          " " +
          feature.properties.PhaseCondStrands +
          " " +
          feature.properties.PhaseCondUnit +
          "</b><br>" +
          feature.properties.Phase +
          "<br>" +
          feature.properties.length
        );
      },
    });
    layer5.value.addTo(initialMap.value);
    rawSeclineData.value.features = rawSavedSeclineFeaturesData.value;

    rawSavedSecpoleFeaturesData.value = [];
    for (let i = 0; i < rawSecpoleData.value.features.length; i++) {
      rawSavedSecpoleFeaturesData.value.push(rawSecpoleData.value.features[i]);
    }
    rawSecpoleData.value.features = [];
    for (let i = 0; i < rawSavedSecpoleFeaturesData.value.length; i++) {
      feature = rawSavedSecpoleFeaturesData.value[i];
      if (feature.properties)
        if (feature.properties.JAEDType)
          if (feature.properties.JAEDType == "LVPole") {
            x2 = feature.geometry.coordinates[0];
            y2 = feature.geometry.coordinates[1];
            x1 = foundFeatureGeometry.coordinates[0];
            y1 = foundFeatureGeometry.coordinates[1];
            distance = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
            if (distance < 0.006) {
              // approximately 500 meters
              rawSecpoleData.value.features.push(feature);
            }
          }
    }
    layer4.value = L.geoJson(rawSecpoleData.value, {
      pointToLayer: (feature, latlng) => {
        if (latlng)
          return L.circleMarker(latlng, {
            radius: 6,
            fillColor: "#ff1188",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8,
          });
      },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(
          "<b>" +
          feature.properties.PoleID +
          "</b><br>" +
          feature.properties.StructureType1 +
          "<br>" +
          feature.properties.PoleType +
          "<br>" +
          feature.properties.Height +
          "<br>" +
          "<a target='_blank' href='https://www.google.com/maps?q&layer=c&cbll=" +
          feature.geometry.coordinates[1] +
          "," +
          feature.geometry.coordinates[0] +
          "&cbp=0,0,0,0,0&z=18'>StreetView</a>"
        );
      },
    });
    layer4.value.addTo(initialMap.value);
    rawSecpoleData.value.features = rawSavedSecpoleFeaturesData.value;

    rawSavedPrilineFeaturesData.value = [];
    for (let i = 0; i < rawPrilineData.value.features.length; i++) {
      rawSavedPrilineFeaturesData.value.push(rawPrilineData.value.features[i]);
    }
    rawPrilineData.value.features = [];
    for (let i = 0; i < rawSavedPrilineFeaturesData.value.length; i++) {
      feature = rawSavedPrilineFeaturesData.value[i];
      if (feature.properties)
        if (feature.properties.JAEDType)
          if (feature.properties.JAEDType == "MVLine") {
            x2 = feature.geometry.coordinates[0][0];
            y2 = feature.geometry.coordinates[0][1];
            x1 = foundFeatureGeometry.coordinates[0];
            y1 = foundFeatureGeometry.coordinates[1];
            distance = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
            if (distance < 0.006) {
              // approximately 500 meters
              rawPrilineData.value.features.push(feature);
            }
          }
    }
    layer6.value = L.geoJson(rawPrilineData.value, {
      style: {
        color: "#ff7800",
        weight: 5,
        opacity: 0.65,
      },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(
          "<b>" +
          feature.properties.PhaseCondSize +
          " " +
          feature.properties.PhaseCondType +
          " " +
          feature.properties.PhaseCondStrands +
          " " +
          feature.properties.PhaseCondUnit +
          "</b><br>" +
          feature.properties.Phase +
          "<br>" +
          feature.properties.length
        );
      },
    });
    layer6.value.addTo(initialMap.value);
    rawPrilineData.value.features = rawSavedPrilineFeaturesData.value;

    rawSavedPripoleFeaturesData.value = [];
    for (let i = 0; i < rawPripoleData.value.features.length; i++) {
      rawSavedPripoleFeaturesData.value.push(rawPripoleData.value.features[i]);
    }
    rawPripoleData.value.features = [];
    for (let i = 0; i < rawSavedPripoleFeaturesData.value.length; i++) {
      feature = rawSavedPripoleFeaturesData.value[i];
      if (feature.properties)
        if (feature.properties.JAEDType)
          if (feature.properties.JAEDType == "MVPole") {
            x2 = feature.geometry.coordinates[0];
            y2 = feature.geometry.coordinates[1];
            x1 = foundFeatureGeometry.coordinates[0];
            y1 = foundFeatureGeometry.coordinates[1];
            distance = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
            if (distance < 0.006) {
              // approximately 500 meters
              rawPripoleData.value.features.push(feature);
            }
          }
    }
    layer3.value = L.geoJson(rawPripoleData.value, {
      pointToLayer: (feature, latlng) => {
        if (latlng)
          return L.circleMarker(latlng, {
            radius: 8,
            fillColor: "#ff7800",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8,
          });
      },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(
          "<b>" +
          feature.properties.PoleID +
          "</b><br>" +
          feature.properties.StructureType1 +
          "<br>" +
          feature.properties.PoleType +
          "<br>" +
          feature.properties.Height +
          "<br>" +
          "<a target='_blank' href='https://www.google.com/maps?q&layer=c&cbll=" +
          feature.geometry.coordinates[1] +
          "," +
          feature.geometry.coordinates[0] +
          "&cbp=0,0,0,0,0&z=18'>StreetView</a>"
        );
      },
    });
    layer3.value.addTo(initialMap.value);
    rawPripoleData.value.features = rawSavedPripoleFeaturesData.value;

    rawSavedDistxmerFeaturesData.value = [];
    for (let i = 0; i < rawDistxmerData.value.features.length; i++) {
      rawSavedDistxmerFeaturesData.value.push(
        rawDistxmerData.value.features[i]
      );
    }
    rawDistxmerData.value.features = [];
    for (let i = 0; i < rawSavedDistxmerFeaturesData.value.length; i++) {
      feature = rawSavedDistxmerFeaturesData.value[i];
      if (feature.properties)
        if (feature.properties.JAEDType)
          if (feature.properties.JAEDType == "DistXmer") {
            x2 = feature.geometry.coordinates[0];
            y2 = feature.geometry.coordinates[1];
            x1 = foundFeatureGeometry.coordinates[0];
            y1 = foundFeatureGeometry.coordinates[1];
            distance = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
            if (distance < 0.006) {
              // approximately 500 meters
              rawDistxmerData.value.features.push(feature);
            }
          }
    }
    layer8.value = L.geoJson(rawDistxmerData.value, {
      pointToLayer: (feature, latlng) => {
        if (latlng)
          return L.circleMarker(latlng, {
            radius: 12,
            fillColor: "#221100",
            color: "#000",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9,
          });
      },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(
          "<b>" +
          feature.properties.Serial +
          " / " +
          feature.properties.CoopID +
          "</b><br>" +
          feature.properties.XmerID +
          "<br>" +
          feature.properties.Phase +
          "<br>" +
          feature.properties.xKVA +
          "kVA<br>" +
          "<a target='_blank' href='https://www.google.com/maps?q&layer=c&cbll=" +
          feature.geometry.coordinates[1] +
          "," +
          feature.geometry.coordinates[0] +
          "&cbp=0,0,0,0,0&z=18'>StreetView</a>"
        );
      },
    });
    layer8.value.addTo(initialMap.value);
    rawDistxmerData.value.features = rawSavedDistxmerFeaturesData.value;

    // zoom to found customer
    initialMap.value.eachLayer((layer) => {
      if (layer.feature)
        if (layer.feature.properties)
          if (layer.feature.properties.JAEDType)
            if (
              layer.feature.properties.JAEDType === "VarLoad" &&
              layer.feature.properties.CustomerID === customerID.value
            ) {
              console.log("Found: ");
              console.log(layer.feature.properties.CustomerID);
              console.log(layer.feature.geometry.coordinates[1]);
              console.log(layer.feature.geometry.coordinates[0]);
              console.log(layer.feature.properties.CustomerName);
              console.log(layer.feature.properties.Address);
              console.log(layer.feature.properties.CustomerType);
              loading.value = false;
              console.log("Ang naka fale kay si hcustomersearch");
              initialMap.value.flyTo(
                new L.LatLng(
                  layer.feature.geometry.coordinates[1],
                  layer.feature.geometry.coordinates[0]
                ),
                19
              );
            }
    });
  }
  rawCustomerData.value.features = rawSavedCustomerFeaturesData.value;
};

const poleSearch = () => {
  rawSavedCustomerFeaturesData.value = [];
  for (let i = 0; i < rawCustomerData.value.features.length; i++) {
    rawSavedCustomerFeaturesData.value.push(rawCustomerData.value.features[i]);
  }
  filteredCustomerData.value = rawCustomerData.value;
  filteredCustomerData.value.features = [];

  var foundPriFeatureGeometry = null;
  var foundSecFeatureGeometry = null;

  for (let i = 0; i < rawSecpoleData.value.features.length; i++) {
    feature = rawSecpoleData.value.features[i];
    if (feature.properties)
      if (feature.properties.JAEDType)
        if (
          feature.properties.JAEDType == "LVPole" &&
          feature.properties.PoleID === customerID.value
        ) {
          foundSecFeatureGeometry = feature.geometry;
          tempMarker = L.marker([
            foundSecFeatureGeometry.coordinates[1],
            foundSecFeatureGeometry.coordinates[0],
          ]).addTo(initialMap.value);
          popup = L.popup().setContent(
            "<b>" +
            feature.properties.PoleID +
            "</b><br>" +
            feature.properties.StructureType1 +
            "<br>" +
            feature.properties.PoleType +
            "<br>" +
            feature.properties.Height +
            "<br>" +
            "<a target='_blank' href='https://www.google.com/maps?q&layer=c&cbll=" +
            feature.geometry.coordinates[1] +
            "," +
            feature.geometry.coordinates[0] +
            "&cbp=0,0,0,0,0&z=18'>StreetView</a>"
          );
          tempMarker.bindPopup(popup).openPopup();
          break;
        }
  }
  for (let i = 0; i < rawPripoleData.value.features.length; i++) {
    var feature = rawPripoleData.value.features[i];
    if (feature.properties)
      if (feature.properties.JAEDType)
        if (
          feature.properties.JAEDType == "MVPole" &&
          feature.properties.PoleID === customerID.value
        ) {
          foundPriFeatureGeometry = feature.geometry;
          var tempMarker = L.marker([
            foundPriFeatureGeometry.coordinates[1],
            foundPriFeatureGeometry.coordinates[0],
          ]).addTo(initialMap.value);
          var popup = L.popup().setContent(
            "<b>" +
            feature.properties.PoleID +
            "</b><br>" +
            feature.properties.StructureType1 +
            "<br>" +
            feature.properties.PoleType +
            "<br>" +
            feature.properties.Height +
            "<br>" +
            "<a target='_blank' href='https://www.google.com/maps?q&layer=c&cbll=" +
            feature.geometry.coordinates[1] +
            "," +
            feature.geometry.coordinates[0] +
            "&cbp=0,0,0,0,0&z=18'>StreetView</a>"
          );
          tempMarker.bindPopup(popup).openPopup();
          break;
        }
  }
  var foundFeatureGeometry = null;
  if (foundPriFeatureGeometry || foundSecFeatureGeometry) {
    if (foundPriFeatureGeometry) {
      foundFeatureGeometry = foundPriFeatureGeometry;
    } else {
      foundFeatureGeometry = foundSecFeatureGeometry;
    }
    for (let i = 0; i < rawSavedCustomerFeaturesData.value.length; i++) {
      feature = rawSavedCustomerFeaturesData.value[i];
      if (feature.properties)
        if (feature.properties.JAEDType)
          if (feature.properties.JAEDType == "VarLoad") {
            var x2 = feature.geometry.coordinates[0];
            var y2 = feature.geometry.coordinates[1];
            var x1 = foundFeatureGeometry.coordinates[0];
            var y1 = foundFeatureGeometry.coordinates[1];
            var distance = Math.sqrt(
              (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)
            );
            if (distance < 0.0011) {
              // approximately 100 meters
              filteredCustomerData.value.features.push(feature);
            }
          }
    }
    layer1.value = L.geoJson(filteredCustomerData.value, {
      pointToLayer: (feature, latlng) => {
        if (latlng)
          return L.circleMarker(latlng, {
            radius: 6,
            fillColor: "#ff7800",
            color: "yellow",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.9,
          });
      },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(
          "<b>" +
          feature.properties.CustomerID +
          "</b><br>" +
          feature.properties.CustomerName +
          "<br>" +
          feature.properties.Address +
          "<br>" +
          "<a target='_blank' href='https://www.google.com/maps?q&layer=c&cbll=" +
          feature.geometry.coordinates[1] +
          "," +
          feature.geometry.coordinates[0] +
          "&cbp=0,0,0,0,0&z=18'>StreetView</a>"
        );
      },
    });
    layer1.value.addTo(initialMap.value);
    rawCustomerData.value.features = rawSavedCustomerFeaturesData.value;

    rawSavedSeclineFeaturesData.value = [];
    for (let i = 0; i < rawSeclineData.value.features.length; i++) {
      rawSavedSeclineFeaturesData.value.push(rawSeclineData.value.features[i]);
    }
    rawSeclineData.value.features = [];
    for (let i = 0; i < rawSavedSeclineFeaturesData.value.length; i++) {
      feature = rawSavedSeclineFeaturesData.value[i];
      if (feature.properties)
        if (feature.properties.JAEDType)
          if (feature.properties.JAEDType == "LVLine") {
            x2 = feature.geometry.coordinates[0][0];
            y2 = feature.geometry.coordinates[0][1];
            x1 = foundFeatureGeometry.coordinates[0];
            y1 = foundFeatureGeometry.coordinates[1];
            distance = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
            if (distance < 0.006) {
              // approximately 500 meters
              rawSeclineData.value.features.push(feature);
            }
          }
    }
    layer5.value = L.geoJson(rawSeclineData.value, {
      style: {
        color: "#ff1144",
        weight: 3,
        opacity: 0.65,
      },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(
          "<b>" +
          feature.properties.PhaseCondSize +
          " " +
          feature.properties.PhaseCondType +
          " " +
          feature.properties.PhaseCondStrands +
          " " +
          feature.properties.PhaseCondUnit +
          "</b><br>" +
          feature.properties.Phase +
          "<br>" +
          feature.properties.length
        );
      },
    });
    layer5.value.addTo(initialMap.value);
    rawSeclineData.value.features = rawSavedSeclineFeaturesData.value;

    rawSavedSecpoleFeaturesData.value = [];
    for (let i = 0; i < rawSecpoleData.value.features.length; i++) {
      rawSavedSecpoleFeaturesData.value.push(rawSecpoleData.value.features[i]);
    }
    rawSecpoleData.value.features = [];
    for (let i = 0; i < rawSavedSecpoleFeaturesData.value.length; i++) {
      feature = rawSavedSecpoleFeaturesData.value[i];
      if (feature.properties)
        if (feature.properties.JAEDType)
          if (feature.properties.JAEDType == "LVPole") {
            x2 = feature.geometry.coordinates[0];
            y2 = feature.geometry.coordinates[1];
            x1 = foundFeatureGeometry.coordinates[0];
            y1 = foundFeatureGeometry.coordinates[1];
            distance = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
            if (distance < 0.006) {
              // approximately 500 meters
              rawSecpoleData.value.features.push(feature);
            }
          }
    }
    layer4.value = L.geoJson(rawSecpoleData.value, {
      pointToLayer: (feature, latlng) => {
        if (latlng)
          return L.circleMarker(latlng, {
            radius: 6,
            fillColor: "#ff1188",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8,
          });
      },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(
          "<b>" +
          feature.properties.PoleID +
          "</b><br>" +
          feature.properties.StructureType1 +
          "<br>" +
          feature.properties.PoleType +
          "<br>" +
          feature.properties.Height +
          "<br>" +
          "<a target='_blank' href='https://www.google.com/maps?q&layer=c&cbll=" +
          feature.geometry.coordinates[1] +
          "," +
          feature.geometry.coordinates[0] +
          "&cbp=0,0,0,0,0&z=18'>StreetView</a>"
        );
      },
    });
    layer4.value.addTo(initialMap.value);
    rawSecpoleData.value.features = rawSavedSecpoleFeaturesData.value;

    rawSavedPrilineFeaturesData.value = [];
    for (let i = 0; i < rawPrilineData.value.features.length; i++) {
      rawSavedPrilineFeaturesData.value.push(rawPrilineData.value.features[i]);
    }
    rawPrilineData.value.features = [];
    for (let i = 0; i < rawSavedPrilineFeaturesData.value.length; i++) {
      feature = rawSavedPrilineFeaturesData.value[i];
      if (feature.properties)
        if (feature.properties.JAEDType)
          if (feature.properties.JAEDType == "MVLine") {
            x2 = feature.geometry.coordinates[0][0];
            y2 = feature.geometry.coordinates[0][1];
            x1 = foundFeatureGeometry.coordinates[0];
            y1 = foundFeatureGeometry.coordinates[1];
            distance = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
            if (distance < 0.006) {
              // approximately 500 meters
              rawPrilineData.value.features.push(feature);
            }
          }
    }
    layer6.value = L.geoJson(rawPrilineData.value, {
      style: {
        color: "#ff7800",
        weight: 5,
        opacity: 0.65,
      },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(
          "<b>" +
          feature.properties.PhaseCondSize +
          " " +
          feature.properties.PhaseCondType +
          " " +
          feature.properties.PhaseCondStrands +
          " " +
          feature.properties.PhaseCondUnit +
          "</b><br>" +
          feature.properties.Phase +
          "<br>" +
          feature.properties.length
        );
      },
    });
    layer6.value.addTo(initialMap.value);
    rawPrilineData.value.features = rawSavedPrilineFeaturesData.value;

    rawSavedPripoleFeaturesData.value = [];
    for (let i = 0; i < rawPripoleData.value.features.length; i++) {
      rawSavedPripoleFeaturesData.value.push(rawPripoleData.value.features[i]);
    }
    rawPripoleData.value.features = [];
    for (let i = 0; i < rawSavedPripoleFeaturesData.value.length; i++) {
      feature = rawSavedPripoleFeaturesData.value[i];
      if (feature.properties)
        if (feature.properties.JAEDType)
          if (feature.properties.JAEDType == "MVPole") {
            x2 = feature.geometry.coordinates[0];
            y2 = feature.geometry.coordinates[1];
            x1 = foundFeatureGeometry.coordinates[0];
            y1 = foundFeatureGeometry.coordinates[1];
            distance = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
            if (distance < 0.006) {
              // approximately 500 meters
              rawPripoleData.value.features.push(feature);
            }
          }
    }
    layer3.value = L.geoJson(rawPripoleData.value, {
      pointToLayer: (feature, latlng) => {
        if (latlng)
          return L.circleMarker(latlng, {
            radius: 8,
            fillColor: "#ff7800",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8,
          });
      },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(
          "<b>" +
          feature.properties.PoleID +
          "</b><br>" +
          feature.properties.StructureType1 +
          "<br>" +
          feature.properties.PoleType +
          "<br>" +
          feature.properties.Height +
          "<br>" +
          "<a target='_blank' href='https://www.google.com/maps?q&layer=c&cbll=" +
          feature.geometry.coordinates[1] +
          "," +
          feature.geometry.coordinates[0] +
          "&cbp=0,0,0,0,0&z=18'>StreetView</a>"
        );
      },
    });
    layer3.value.addTo(initialMap.value);
    rawPripoleData.value.features = rawSavedPripoleFeaturesData.value;

    rawSavedDistxmerFeaturesData.value = [];
    for (let i = 0; i < rawDistxmerData.value.features.length; i++) {
      rawSavedDistxmerFeaturesData.value.push(
        rawDistxmerData.value.features[i]
      );
    }
    rawDistxmerData.value.features = [];
    for (let i = 0; i < rawSavedDistxmerFeaturesData.value.length; i++) {
      feature = rawSavedDistxmerFeaturesData.value[i];
      if (feature.properties)
        if (feature.properties.JAEDType)
          if (feature.properties.JAEDType == "DistXmer") {
            x2 = feature.geometry.coordinates[0];
            y2 = feature.geometry.coordinates[1];
            x1 = foundFeatureGeometry.coordinates[0];
            y1 = foundFeatureGeometry.coordinates[1];
            distance = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
            if (distance < 0.006) {
              // approximately 500 meters
              rawDistxmerData.value.features.push(feature);
            }
          }
    }
    layer8.value = L.geoJson(rawDistxmerData.value, {
      pointToLayer: (feature, latlng) => {
        if (latlng)
          return L.circleMarker(latlng, {
            radius: 12,
            fillColor: "#221100",
            color: "#000",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9,
          });
      },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(
          "<b>" +
          feature.properties.Serial +
          " / " +
          feature.properties.CoopID +
          "</b><br>" +
          feature.properties.XmerID +
          "<br>" +
          feature.properties.Phase +
          "<br>" +
          feature.properties.xKVA +
          "kVA<br>" +
          "<a target='_blank' href='https://www.google.com/maps?q&layer=c&cbll=" +
          feature.geometry.coordinates[1] +
          "," +
          feature.geometry.coordinates[0] +
          "&cbp=0,0,0,0,0&z=18'>StreetView</a>"
        );
      },
    });
    layer8.value.addTo(initialMap.value);
    rawDistxmerData.value.features = rawSavedDistxmerFeaturesData.value;

    // zoom to found customer
    initialMap.value.eachLayer((layer) => {
      if (layer.feature)
        if (layer.feature.properties)
          if (layer.feature.properties.JAEDType)
            if (layer.feature.properties.PoleID === customerID.value) {
              console.log("Found: ");
              console.log(layer.feature.properties.PoleID);
              console.log(layer.feature.geometry.coordinates[1]);
              console.log(layer.feature.geometry.coordinates[0]);
              console.log(layer.feature.properties.CustomerName);
              loading.value = false;
              console.log("Ang naka fale kay si hpole search");
              initialMap.value.flyTo(
                new L.LatLng(
                  layer.feature.geometry.coordinates[1],
                  layer.feature.geometry.coordinates[0]
                ),
                19
              );
            }
    });
  }
};

const xmerSearch = () => {
  var foundDistxmerFeatureGeometry = null;
  for (let i = 0; i < rawDistxmerData.value.features.length; i++) {
    var feature = rawDistxmerData.value.features[i];
    if (feature.properties)
      if (feature.properties.JAEDType)
        if (
          feature.properties.JAEDType === "DistXmer" &&
          (feature.properties.Serial === customerID.value ||
            feature.properties.XmerID === customerID.value ||
            feature.properties.CoopID === customerID.value)
        ) {
          foundDistxmerFeatureGeometry = feature.geometry;
          var tempMarker = L.marker([
            foundDistxmerFeatureGeometry.coordinates[1],
            foundDistxmerFeatureGeometry.coordinates[0],
          ]).addTo(initialMap.value);
          var popup = L.popup().setContent(
            "<b>" +
            feature.properties.Serial +
            " / " +
            feature.properties.CoopID +
            "</b><br>" +
            feature.properties.XmerID +
            "<br>" +
            feature.properties.Phase +
            "<br>" +
            feature.properties.xKVA +
            "kVA<br>" +
            "<a target='_blank' href='https://www.google.com/maps?q&layer=c&cbll=" +
            feature.geometry.coordinates[1] +
            "," +
            feature.geometry.coordinates[0] +
            "&cbp=0,0,0,0,0&z=18'>StreetView</a>"
          );
          tempMarker.bindPopup(popup).openPopup();
          break;
        }
  }
  if (foundDistxmerFeatureGeometry) {
    var foundFeatureGeometry = foundDistxmerFeatureGeometry;
    rawSavedCustomerFeaturesData.value = [];
    for (let i = 0; i < rawCustomerData.value.features.length; i++) {
      rawSavedCustomerFeaturesData.value.push(
        rawCustomerData.value.features[i]
      );
    }
    filteredCustomerData.value = rawCustomerData.value;
    filteredCustomerData.value.features = [];
    for (let i = 0; i < rawSavedCustomerFeaturesData.value.length; i++) {
      var feature = rawSavedCustomerFeaturesData.value[i];
      if (feature.properties)
        if (feature.properties.JAEDType)
          if (feature.properties.JAEDType == "VarLoad") {
            var x2 = feature.geometry.coordinates[0];
            var y2 = feature.geometry.coordinates[1];
            var x1 = foundFeatureGeometry.coordinates[0];
            var y1 = foundFeatureGeometry.coordinates[1];
            var distance = Math.sqrt(
              (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)
            );
            if (distance < 0.0011) {
              // approximately 100 meters
              filteredCustomerData.value.features.push(feature);
            }
          }
    }
    layer1.value = L.geoJson(filteredCustomerData.value, {
      pointToLayer: (feature, latlng) => {
        if (latlng)
          return L.circleMarker(latlng, {
            radius: 6,
            fillColor: "#ff7800",
            color: "yellow",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.9,
          });
      },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(
          "<b>" +
          feature.properties.CustomerID +
          "</b><br>" +
          feature.properties.CustomerName +
          "<br>" +
          feature.properties.Address +
          "<br>" +
          "<a target='_blank' href='https://www.google.com/maps?q&layer=c&cbll=" +
          feature.geometry.coordinates[1] +
          "," +
          feature.geometry.coordinates[0] +
          "&cbp=0,0,0,0,0&z=18'>StreetView</a>"
        );
      },
    });
    layer1.value.addTo(initialMap.value);
    rawCustomerData.value.features = rawSavedCustomerFeaturesData.value;

    rawSavedSeclineFeaturesData.value = [];
    for (let i = 0; i < rawSeclineData.value.features.length; i++) {
      rawSavedSeclineFeaturesData.value.push(rawSeclineData.value.features[i]);
    }
    rawSeclineData.value.features = [];
    for (let i = 0; i < rawSavedSeclineFeaturesData.value.length; i++) {
      var feature = rawSavedSeclineFeaturesData.value[i];
      if (feature.properties)
        if (feature.properties.JAEDType)
          if (feature.properties.JAEDType == "LVLine") {
            x2 = feature.geometry.coordinates[0][0];
            y2 = feature.geometry.coordinates[0][1];
            x1 = foundFeatureGeometry.coordinates[0];
            y1 = foundFeatureGeometry.coordinates[1];
            distance = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
            if (distance < 0.006) {
              // approximately 500 meters
              rawSeclineData.value.features.push(feature);
            }
          }
    }
    layer5.value = L.geoJson(rawSeclineData.value, {
      style: {
        color: "#ff1144",
        weight: 3,
        opacity: 0.65,
      },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(
          "<b>" +
          feature.properties.PhaseCondSize +
          " " +
          feature.properties.PhaseCondType +
          " " +
          feature.properties.PhaseCondStrands +
          " " +
          feature.properties.PhaseCondUnit +
          "</b><br>" +
          feature.properties.Phase +
          "<br>" +
          feature.properties.length
        );
      },
    });
    layer5.value.addTo(initialMap.value);
    rawSeclineData.value.features = rawSavedSeclineFeaturesData.value;

    rawSavedSecpoleFeaturesData.value = [];
    for (let i = 0; i < rawSecpoleData.value.features.length; i++) {
      rawSavedSecpoleFeaturesData.value.push(rawSecpoleData.value.features[i]);
    }
    rawSecpoleData.value.features = [];
    for (let i = 0; i < rawSavedSecpoleFeaturesData.value.length; i++) {
      var feature = rawSavedSecpoleFeaturesData.value[i];
      if (feature.properties)
        if (feature.properties.JAEDType)
          if (feature.properties.JAEDType == "LVPole") {
            x2 = feature.geometry.coordinates[0];
            y2 = feature.geometry.coordinates[1];
            x1 = foundFeatureGeometry.coordinates[0];
            y1 = foundFeatureGeometry.coordinates[1];
            distance = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
            if (distance < 0.006) {
              // approximately 500 meters
              rawSecpoleData.value.features.push(feature);
            }
          }
    }
    layer4.value = L.geoJson(rawSecpoleData.value, {
      pointToLayer: (feature, latlng) => {
        if (latlng)
          return L.circleMarker(latlng, {
            radius: 6,
            fillColor: "#ff1188",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8,
          });
      },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(
          "<b>" +
          feature.properties.PoleID +
          "</b><br>" +
          feature.properties.StructureType1 +
          "<br>" +
          feature.properties.PoleType +
          "<br>" +
          feature.properties.Height +
          "<br>" +
          "<a target='_blank' href='https://www.google.com/maps?q&layer=c&cbll=" +
          feature.geometry.coordinates[1] +
          "," +
          feature.geometry.coordinates[0] +
          "&cbp=0,0,0,0,0&z=18'>StreetView</a>"
        );
      },
    });
    layer4.value.addTo(initialMap.value);
    rawSecpoleData.value.features = rawSavedSecpoleFeaturesData.value;

    rawSavedPrilineFeaturesData.value = [];
    for (let i = 0; i < rawPrilineData.value.features.length; i++) {
      rawSavedPrilineFeaturesData.value.push(rawPrilineData.value.features[i]);
    }
    rawPrilineData.value.features = [];
    for (let i = 0; i < rawSavedPrilineFeaturesData.value.length; i++) {
      var feature = rawSavedPrilineFeaturesData.value[i];
      if (feature.properties)
        if (feature.properties.JAEDType)
          if (feature.properties.JAEDType == "MVLine") {
            x2 = feature.geometry.coordinates[0][0];
            y2 = feature.geometry.coordinates[0][1];
            x1 = foundFeatureGeometry.coordinates[0];
            y1 = foundFeatureGeometry.coordinates[1];
            distance = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
            if (distance < 0.006) {
              // approximately 500 meters
              rawPrilineData.value.features.push(feature);
            }
          }
    }
    layer6.value = L.geoJson(rawPrilineData.value, {
      style: {
        color: "#ff7800",
        weight: 5,
        opacity: 0.65,
      },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(
          "<b>" +
          feature.properties.PhaseCondSize +
          " " +
          feature.properties.PhaseCondType +
          " " +
          feature.properties.PhaseCondStrands +
          " " +
          feature.properties.PhaseCondUnit +
          "</b><br>" +
          feature.properties.Phase +
          "<br>" +
          feature.properties.length
        );
      },
    });
    layer6.value.addTo(initialMap.value);
    rawPrilineData.value.features = rawSavedPrilineFeaturesData.value;

    rawSavedPripoleFeaturesData.value = [];
    for (let i = 0; i < rawPripoleData.value.features.length; i++) {
      rawSavedPripoleFeaturesData.value.push(rawPripoleData.value.features[i]);
    }
    rawPripoleData.value.features = [];
    for (let i = 0; i < rawSavedPripoleFeaturesData.value.length; i++) {
      var feature = rawSavedPripoleFeaturesData.value[i];
      if (feature.properties)
        if (feature.properties.JAEDType)
          if (feature.properties.JAEDType == "MVPole") {
            x2 = feature.geometry.coordinates[0];
            y2 = feature.geometry.coordinates[1];
            x1 = foundFeatureGeometry.coordinates[0];
            y1 = foundFeatureGeometry.coordinates[1];
            distance = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
            if (distance < 0.006) {
              // approximately 500 meters
              rawPripoleData.value.features.push(feature);
            }
          }
    }
    layer3.value = L.geoJson(rawPripoleData.value, {
      pointToLayer: (feature, latlng) => {
        if (latlng)
          return L.circleMarker(latlng, {
            radius: 8,
            fillColor: "#ff7800",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8,
          });
      },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(
          "<b>" +
          feature.properties.PoleID +
          "</b><br>" +
          feature.properties.StructureType1 +
          "<br>" +
          feature.properties.PoleType +
          "<br>" +
          feature.properties.Height +
          "<br>" +
          "<a target='_blank' href='https://www.google.com/maps?q&layer=c&cbll=" +
          feature.geometry.coordinates[1] +
          "," +
          feature.geometry.coordinates[0] +
          "&cbp=0,0,0,0,0&z=18'>StreetView</a>"
        );
      },
    });
    layer3.value.addTo(initialMap.value);
    rawPripoleData.value.features = rawSavedPripoleFeaturesData.value;

    rawSavedDistxmerFeaturesData.value = [];
    for (let i = 0; i < rawDistxmerData.value.features.length; i++) {
      rawSavedDistxmerFeaturesData.value.push(
        rawDistxmerData.value.features[i]
      );
    }
    rawDistxmerData.value.features = [];
    for (let i = 0; i < rawSavedDistxmerFeaturesData.value.length; i++) {
      var feature = rawSavedDistxmerFeaturesData.value[i];
      if (feature.properties)
        if (feature.properties.JAEDType)
          if (feature.properties.JAEDType == "DistXmer") {
            x2 = feature.geometry.coordinates[0];
            y2 = feature.geometry.coordinates[1];
            x1 = foundFeatureGeometry.coordinates[0];
            y1 = foundFeatureGeometry.coordinates[1];
            distance = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
            if (distance < 0.006) {
              // approximately 500 meters
              rawDistxmerData.value.features.push(feature);
            }
          }
    }
    layer8.value = L.geoJson(rawDistxmerData.value, {
      pointToLayer: (feature, latlng) => {
        if (latlng)
          return L.circleMarker(latlng, {
            radius: 12,
            fillColor: "#221100",
            color: "#000",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9,
          });
      },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(
          "<b>" +
          feature.properties.Serial +
          " / " +
          feature.properties.CoopID +
          "</b><br>" +
          feature.properties.XmerID +
          "<br>" +
          feature.properties.Phase +
          "<br>" +
          feature.properties.xKVA +
          "kVA<br>" +
          "<a target='_blank' href='https://www.google.com/maps?q&layer=c&cbll=" +
          feature.geometry.coordinates[1] +
          "," +
          feature.geometry.coordinates[0] +
          "&cbp=0,0,0,0,0&z=18'>StreetView</a>"
        );
      },
    });
    layer8.value.addTo(initialMap.value);
    rawDistxmerData.value.features = rawSavedDistxmerFeaturesData.value;

    // zoom to found customer
    initialMap.value.eachLayer((layer) => {
      if (layer.feature)
        if (layer.feature.properties)
          if (layer.feature.properties.JAEDType)
            if (
              layer.feature.properties.Serial === customerID.value ||
              layer.feature.properties.XmerID === customerID.value ||
              layer.feature.properties.CoopID === customerID.value
            ) {
              console.log("Found: ");
              console.log(layer.feature.properties.XmerID);
              console.log(layer.feature.geometry.coordinates[1]);
              console.log(layer.feature.geometry.coordinates[0]);
              console.log(layer.feature.properties.xKVA);
              loading.value = false;
              console.log("Ang naka fale kay si xmerar");
              initialMap.value.flyTo(
                new L.LatLng(
                  layer.feature.geometry.coordinates[1],
                  layer.feature.geometry.coordinates[0]
                ),
                19
              );
            }
    });
  }
};

const hvpoleSearch = () => {
  var foundSubtranspoleFeatureGeometry = null;
  for (let i = 0; i < rawSubtranspoleData.value.features.length; i++) {
    var feature = rawSubtranspoleData.value.features[i];
    if (feature.properties)
      if (feature.properties.JAEDType)
        if (
          feature.properties.JAEDType == "HVPole" &&
          feature.properties.PoleID === customerID.value
        ) {
          foundSubtranspoleFeatureGeometry = feature.geometry;
          var tempMarker = L.marker([
            foundSubtranspoleFeatureGeometry.coordinates[1],
            foundSubtranspoleFeatureGeometry.coordinates[0],
          ]).addTo(initialMap.value);
          var popup = L.popup().setContent(
            "<b>" +
            feature.properties.PoleID +
            "</b><br>" +
            feature.properties.StructureType1 +
            "<br>" +
            feature.properties.PoleType +
            "<br>" +
            feature.properties.Height +
            "<br>" +
            "<a target='_blank' href='https://www.google.com/maps?q&layer=c&cbll=" +
            feature.geometry.coordinates[1] +
            "," +
            feature.geometry.coordinates[0] +
            "&cbp=0,0,0,0,0&z=18'>StreetView</a>"
          );
          tempMarker.bindPopup(popup).openPopup();
          break;
        }
  }
  if (foundSubtranspoleFeatureGeometry) {
    // zoom to found customer
    initialMap.value.eachLayer((layer) => {
      if (layer.feature)
        if (layer.feature.properties)
          if (layer.feature.properties.JAEDType)
            if (layer.feature.properties.PoleID === customerID.value) {
              console.log("Found: ");
              console.log(layer.feature.properties.PoleID);
              console.log(layer.feature.geometry.coordinates[1]);
              console.log(layer.feature.geometry.coordinates[0]);
              loading.value = false;
              console.log("Ang naka fale kay si hvpole");
              initialMap.value.flyTo(
                new L.LatLng(
                  layer.feature.geometry.coordinates[1],
                  layer.feature.geometry.coordinates[0]
                ),
                19
              );
            }
    });
  }
};

const showAllCustomersHere = () => {
  loading.value = true;
  setTimeout(showAllCustomersHere1, 100);
};

const showAllCustomersHere1 = () => {
  var databounds = initialMap.value.getBounds();
  rawSavedCustomerFeaturesData.value = [];
  for (let i = 0; i < rawCustomerData.value.features.length; i++) {
    rawSavedCustomerFeaturesData.value.push(rawCustomerData.value.features[i]);
  }
  filteredCustomerData.value = rawCustomerData.value;
  filteredCustomerData.value.features = [];
  for (let i = 0; i < rawSavedCustomerFeaturesData.value.length; i++) {
    var feature = rawSavedCustomerFeaturesData.value[i];
    if (feature.properties)
      if (feature.properties.JAEDType)
        if (feature.properties.JAEDType == "VarLoad") {
          var x2 = feature.geometry.coordinates[0];
          var y2 = feature.geometry.coordinates[1];
          var miny1 = databounds._southWest.lat;
          var minx1 = databounds._southWest.lng;
          var maxy1 = databounds._northEast.lat;
          var maxx1 = databounds._northEast.lng;
          if (minx1 < x2 && x2 <= maxx1 && miny1 < y2 && y2 <= maxy1) {
            filteredCustomerData.value.features.push(feature);
          }
        }
  }
  layer1.value = L.geoJson(filteredCustomerData.value, {
    pointToLayer: (feature, latlng) => {
      if (latlng)
        return L.circleMarker(latlng, {
          radius: 6,
          fillColor: "#ff7800",
          color: "yellow",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.9,
        });
    },
    onEachFeature: (feature, layer) => {
      layer.bindPopup(
        "<b>" +
        feature.properties.CustomerID +
        "</b><br>" +
        feature.properties.CustomerName +
        "<br>" +
        feature.properties.Address +
        "<br>" +
        "<a target='_blank' href='https://www.google.com/maps?q&layer=c&cbll=" +
        feature.geometry.coordinates[1] +
        "," +
        feature.geometry.coordinates[0] +
        "&cbp=0,0,0,0,0&z=18'>StreetView</a>"
      );
    },
  });
  layer1.value.addTo(initialMap.value);
  rawCustomerData.value.features = rawSavedCustomerFeaturesData.value;
  loading.value = false;
  closeOffCanvasMenu();
};

const checkoutThisPlace = () => {
  loading.value = true;
  setTimeout(checkoutThisPlace1, 100);
};

const checkoutThisPlace1 = () => {
  var databounds = initialMap.value.getBounds();
  rawSavedSeclineFeaturesData.value = [];
  for (let i = 0; i < rawSeclineData.value.features.length; i++) {
    rawSavedSeclineFeaturesData.value.push(rawSeclineData.value.features[i]);
  }
  rawSeclineData.value.features = [];
  for (let i = 0; i < rawSavedSeclineFeaturesData.value.length; i++) {
    var feature = rawSavedSeclineFeaturesData.value[i];
    if (feature.properties)
      if (feature.properties.JAEDType)
        if (feature.properties.JAEDType == "LVLine") {
          var x2 = feature.geometry.coordinates[0][0];
          var y2 = feature.geometry.coordinates[0][1];
          var miny1 = databounds._southWest.lat;
          var minx1 = databounds._southWest.lng;
          var maxy1 = databounds._northEast.lat;
          var maxx1 = databounds._northEast.lng;
          if (minx1 < x2 && x2 <= maxx1 && miny1 < y2 && y2 <= maxy1) {
            rawSeclineData.value.features.push(feature);
          }
        }
  }
  layer5.value = L.geoJson(rawSeclineData.value, {
    style: {
      color: "#ff1144",
      weight: 3,
      opacity: 0.65,
    },
    onEachFeature: (feature, layer) => {
      layer.bindPopup(
        "<b>" +
        feature.properties.PhaseCondSize +
        " " +
        feature.properties.PhaseCondType +
        " " +
        feature.properties.PhaseCondStrands +
        " " +
        feature.properties.PhaseCondUnit +
        "</b><br>" +
        feature.properties.Phase +
        "<br>" +
        feature.properties.length
      );
    },
  });
  layer5.value.addTo(initialMap.value);
  rawSeclineData.value.features = rawSavedSeclineFeaturesData.value;

  rawSavedSecpoleFeaturesData.value = [];
  for (let i = 0; i < rawSecpoleData.value.features.length; i++) {
    rawSavedSecpoleFeaturesData.value.push(rawSecpoleData.value.features[i]);
  }
  rawSecpoleData.value.features = [];
  for (let i = 0; i < rawSavedSecpoleFeaturesData.value.length; i++) {
    feature = rawSavedSecpoleFeaturesData.value[i];
    if (feature.properties)
      if (feature.properties.JAEDType)
        if (feature.properties.JAEDType == "LVPole") {
          x2 = feature.geometry.coordinates[0];
          y2 = feature.geometry.coordinates[1];
          miny1 = databounds._southWest.lat;
          minx1 = databounds._southWest.lng;
          maxy1 = databounds._northEast.lat;
          maxx1 = databounds._northEast.lng;
          if (minx1 < x2 && x2 <= maxx1 && miny1 < y2 && y2 <= maxy1) {
            rawSecpoleData.value.features.push(feature);
          }
        }
  }
  layer4.value = L.geoJson(rawSecpoleData.value, {
    pointToLayer: (feature, latlng) => {
      if (latlng)
        return L.circleMarker(latlng, {
          radius: 6,
          fillColor: "#ff1188",
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8,
        });
    },
    onEachFeature: (feature, layer) => {
      layer.bindPopup(
        "<b>" +
        feature.properties.PoleID +
        "</b><br>" +
        feature.properties.StructureType1 +
        "<br>" +
        feature.properties.PoleType +
        "<br>" +
        feature.properties.Height +
        "<br>" +
        "<a target='_blank' href='https://www.google.com/maps?q&layer=c&cbll=" +
        feature.geometry.coordinates[1] +
        "," +
        feature.geometry.coordinates[0] +
        "&cbp=0,0,0,0,0&z=18'>StreetView</a>"
      );
    },
  });
  layer4.value.addTo(initialMap.value);
  rawSecpoleData.value.features = rawSavedSecpoleFeaturesData.value;

  rawSavedPrilineFeaturesData.value = [];
  for (let i = 0; i < rawPrilineData.value.features.length; i++) {
    rawSavedPrilineFeaturesData.value.push(rawPrilineData.value.features[i]);
  }
  rawPrilineData.value.features = [];
  for (let i = 0; i < rawSavedPrilineFeaturesData.value.length; i++) {
    feature = rawSavedPrilineFeaturesData.value[i];
    if (feature.properties)
      if (feature.properties.JAEDType)
        if (feature.properties.JAEDType == "MVLine") {
          x2 = feature.geometry.coordinates[0][0];
          y2 = feature.geometry.coordinates[0][1];
          miny1 = databounds._southWest.lat;
          minx1 = databounds._southWest.lng;
          maxy1 = databounds._northEast.lat;
          maxx1 = databounds._northEast.lng;
          if (minx1 < x2 && x2 <= maxx1 && miny1 < y2 && y2 <= maxy1) {
            rawPrilineData.value.features.push(feature);
          }
        }
  }
  layer6.value = L.geoJson(rawPrilineData.value, {
    style: {
      color: "#ff7800",
      weight: 5,
      opacity: 0.65,
    },
    onEachFeature: (feature, layer) => {
      layer.bindPopup(
        "<b>" +
        feature.properties.PhaseCondSize +
        " " +
        feature.properties.PhaseCondType +
        " " +
        feature.properties.PhaseCondStrands +
        " " +
        feature.properties.PhaseCondUnit +
        "</b><br>" +
        feature.properties.Phase +
        "<br>" +
        feature.properties.length
      );
    },
  });
  layer6.value.addTo(initialMap.value);
  rawPrilineData.value.features = rawSavedPrilineFeaturesData.value;

  rawSavedPripoleFeaturesData.value = [];
  for (let i = 0; i < rawPripoleData.value.features.length; i++) {
    rawSavedPripoleFeaturesData.value.push(rawPripoleData.value.features[i]);
  }
  rawPripoleData.value.features = [];
  for (let i = 0; i < rawSavedPripoleFeaturesData.value.length; i++) {
    feature = rawSavedPripoleFeaturesData.value[i];
    if (feature.properties)
      if (feature.properties.JAEDType)
        if (feature.properties.JAEDType == "MVPole") {
          x2 = feature.geometry.coordinates[0];
          y2 = feature.geometry.coordinates[1];
          miny1 = databounds._southWest.lat;
          minx1 = databounds._southWest.lng;
          maxy1 = databounds._northEast.lat;
          maxx1 = databounds._northEast.lng;
          if (minx1 < x2 && x2 <= maxx1 && miny1 < y2 && y2 <= maxy1) {
            rawPripoleData.value.features.push(feature);
          }
        }
  }
  layer3.value = L.geoJson(rawPripoleData.value, {
    pointToLayer: (feature, latlng) => {
      if (latlng)
        return L.circleMarker(latlng, {
          radius: 8,
          fillColor: "#ff7800",
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8,
        });
    },
    onEachFeature: (feature, layer) => {
      layer.bindPopup(
        "<b>" +
        feature.properties.PoleID +
        "</b><br>" +
        feature.properties.StructureType1 +
        "<br>" +
        feature.properties.PoleType +
        "<br>" +
        feature.properties.Height +
        "<br>" +
        "<a target='_blank' href='https://www.google.com/maps?q&layer=c&cbll=" +
        feature.geometry.coordinates[1] +
        "," +
        feature.geometry.coordinates[0] +
        "&cbp=0,0,0,0,0&z=18'>StreetView</a>"
      );
    },
  });
  layer3.value.addTo(initialMap.value);
  rawPripoleData.value.features = rawSavedPripoleFeaturesData.value;

  rawSavedDistxmerFeaturesData.value = [];
  for (let i = 0; i < rawDistxmerData.value.features.length; i++) {
    rawSavedDistxmerFeaturesData.value.push(rawDistxmerData.value.features[i]);
  }
  rawDistxmerData.value.features = [];
  for (let i = 0; i < rawSavedDistxmerFeaturesData.value.length; i++) {
    feature = rawSavedDistxmerFeaturesData.value[i];
    if (feature.properties)
      if (feature.properties.JAEDType)
        if (feature.properties.JAEDType == "DistXmer") {
          x2 = feature.geometry.coordinates[0];
          y2 = feature.geometry.coordinates[1];
          miny1 = databounds._southWest.lat;
          minx1 = databounds._southWest.lng;
          maxy1 = databounds._northEast.lat;
          maxx1 = databounds._northEast.lng;
          if (minx1 < x2 && x2 <= maxx1 && miny1 < y2 && y2 <= maxy1) {
            rawDistxmerData.value.features.push(feature);
          }
        }
  }
  layer8.value = L.geoJson(rawDistxmerData.value, {
    pointToLayer: (feature, latlng) => {
      if (latlng)
        return L.circleMarker(latlng, {
          radius: 12,
          fillColor: "#221100",
          color: "#000",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
        });
    },
    onEachFeature: (feature, layer) => {
      layer.bindPopup(
        "<b>" +
        feature.properties.Serial +
        " / " +
        feature.properties.CoopID +
        "</b><br>" +
        feature.properties.XmerID +
        "<br>" +
        feature.properties.Phase +
        "<br>" +
        feature.properties.xKVA +
        "kVA<br>" +
        "<a target='_blank' href='https://www.google.com/maps?q&layer=c&cbll=" +
        feature.geometry.coordinates[1] +
        "," +
        feature.geometry.coordinates[0] +
        "&cbp=0,0,0,0,0&z=18'>StreetView</a>"
      );
    },
  });
  layer8.value.addTo(initialMap.value);
  rawDistxmerData.value.features = rawSavedDistxmerFeaturesData.value;
  loading.value = false;
  closeOffCanvasMenu();
};

const navbarTogglerClicked = () => {
  initialMap.value.closePopup(); // close all popups before searching
};

const customerSearch = () => {
  if (customerID.value && customerID.value.length > 0) {
    loading.value = true;
    error_message.value = "";
    setTimeout(customerSearch1, 100);
  } else {
    error_message.value = "Error: Search key cannot be empty...";
  }
}

const searchkeyClick = (string_value) => {
  customerID.value = string_value;
};

const customerSearch1 = () => {
  var searchIsUnique = true;
  const date = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const formattedDate = formatter.format(date);
  loading.value = true;
  if (customerID.value.includes("ST")) hvpoleSearch();
  else if (customerID.value.includes("C")) poleSearch();
  else if (customerID.value.includes("T")) xmerSearch();
  else listOfCustomerFeatures();
  if (!loading.value) {
    // found
    closeOffCanvasMenu();
    error_message.value = "";
    for (let i = 0; i < searchList.value.length; i++) { // check if search key is unique before saving
      if (searchList.value[i].string_value === customerID.value) { searchIsUnique = false; };
    }
    if (searchIsUnique)
      searchList.value.push({
        id: uid(),
        string_value: customerID.value,
        found: true,
        data: formattedDate,
      });
  } else {
    // not found
    error_message.value = "Error: Search key not found...";
    loading.value = false;
    console.log("searching not found");
    for (let i = 0; i < searchList.value.length; i++) { // check if search key is unique before saving
      if (searchList.value[i].string_value === customerID.value) { searchIsUnique = false; };
    }
    console.log("searching not found - save key");
    if (searchIsUnique)
      searchList.value.push({
        id: uid(),
        string_value: customerID.value,
        found: false,
        data: formattedDate,
      });
  }
};

const whereAmILocatedClick = () => {
  loading.value = true;
  setTimeout(whereAmILocatedClick1, 200);
}

const whereAmILocatedClick1 = () => {
  gpsStuck.value = true;
  if (initialMap.value && gps.value) {
    initialMap.value.flyTo([gps.value.coords.latitude, gps.value.coords.longitude], 18);
  };
  closeOffCanvasMenu();
  loading.value = false;
};

const checkIfAllDataAreDownloaded = (afterDataIsLoaded) => {
  const myModal = new bootstrap.Modal(document.getElementById("exampleModal")); // creating modal object
  myModal.show();
  //check if all the geojson file is done downloading
  var refreshIntervalId = setInterval(() => {
    if (
      rawUsersData.value &&
      rawCustomerData.value &&
      rawPrilineData.value &&
      rawPripoleData.value &&
      rawSeclineData.value &&
      rawSecpoleData.value &&
      rawDistxmerData.value) {
      clearInterval(refreshIntervalId);
      setTimeout(() => {
        myModal.hide();
        if (afterDataIsLoaded) afterDataIsLoaded();
      }, 2000);
    }
  }, 500);

};

const login = () => {
  console.log(rawUsersData.value.length);
  loginloading.value = true;
  setTimeout(() => {
    for (let i = 0; i < rawUsersData.value.length; i++) {
      if (rawUsersData.value[i].username === username.value && rawUsersData.value[i].password === password.value) { // creating modal object
        loginexampleModal.value.hide();
        console.log("login ok");
        loginloading.value = false;
        coopName.value = spnsAddress + username.value + coopAddress;
        //document.title = coopName.value;
        return true;
      }
    }
    loginloading.value = false;
    loginerror.value = true;
  }, 3000);
};

const logout = () => {
  username.value = null;
  password.value = null;
  loginexampleModal.value.show();
}

onMounted(() => {
  // register variables to be saved and retreived internally
  mem.register("garrycachi_searchList", searchList);
  mem.register("garrycachi_customerID", customerID);

  // change the document title
  document.title = "JAED";

  // initialize map
  initialMap.value = L.map("map", {
    maxZoom: 23,
    minZoom: 6,
    zoomControl: false
  }).setView(
    coopMainCoordinates,
    initialMapZoom,
  );
  L.control.zoom({
    position: 'bottomleft'
  }).addTo(initialMap.value);
  // this prevents zoom animation error, part of map setup
  L.Popup.prototype._animateZoom = (e) => {
    if (!initialMap.value._map) {
      return;
    }
    var pos = initialMap.value._map._latLngToNewLayerPoint(
      initialMap.value._latlng,
      e.zoom,
      e.center
    ),
      anchor = initialMap.value._getAnchor();
    L.DomUtil.setPosition(initialMap.value._container, pos.add(anchor));
  };

  // opening the 'Modal Start Loading Data Animation' form
  // checking if all geoJSON is downloaded
  // if so, close the 'Modal Start Loading Data Animation'
  // and draw on map the subtrans line, pole and power xmers
  checkIfAllDataAreDownloaded(() => {
    layer2.value = L.geoJson(rawSubtranspoleData.value, {
      pointToLayer: (feature, latlng) => {
        return L.circleMarker(latlng, {
          radius: 7,
          fillColor: "#447855",
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8,
        });
      },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(
          "<b>" +
          feature.properties.PoleID +
          "</b><br>" +
          feature.properties.StructureType1 +
          "<br>" +
          feature.properties.PoleType +
          "<br>" +
          feature.properties.Height +
          "<br>" +
          "<a target='_blank' href='https://www.google.com/maps?q&layer=c&cbll=" +
          feature.geometry.coordinates[1] +
          "," +
          feature.geometry.coordinates[0] +
          "&cbp=0,0,0,0,0&z=18'>StreetView</a>"
        );
      },
    });
    layer2.value.addTo(initialMap.value);

    layer7.value = L.geoJson(rawSubtranslineData.value, {
      style: {
        color: "yellow",
        weight: 7,
        opacity: 0.95,
      },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(
          "<b>" +
          feature.properties.PhaseCondSize +
          " " +
          feature.properties.PhaseCondType +
          " " +
          feature.properties.PhaseCondStrands +
          " " +
          feature.properties.PhaseCondUnit +
          "</b><br>" +
          feature.properties.Phase +
          "<br>" +
          feature.properties.length
        );
      },
    });
    layer7.value.addTo(initialMap.value);

    layer9.value = L.geoJson(rawSubtransXmerData.value, {
      pointToLayer: (feature, latlng) => {
        return L.marker(latlng, {
          icon: L.icon({
            iconUrl: "/powerxmer.png",
            iconSize: [30, 30], // size of the icon
            shadowSize: [30, 20], // size of the shadow
            iconAnchor: [0, 0], // point of the icon which will correspond to marker's location
            shadowAnchor: [0, 0], // the same for the shadow
            popupAnchor: [15, -1], // point from which the popup should open relative to the iconAnchor
          }),
        });
      },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(
          "<b>" +
          feature.properties.XmerID +
          "</b><br>" +
          feature.properties.KVA +
          " kVA" +
          "<br>" +
          feature.properties.percentZ +
          "% Impedance" +
          "<br>" +
          feature.properties.KVp +
          "/" +
          feature.properties.KVs +
          " kV" +
          "<br>" +
          feature.properties.Brand +
          "<br>" +
          feature.properties.Model +
          "<br>" +
          "<a target='_blank' href='https://www.google.com/maps?q&layer=c&cbll=" +
          feature.geometry.coordinates[1] +
          "," +
          feature.geometry.coordinates[0] +
          "&cbp=0,0,0,0,0&z=18'>StreetView</a>"
        );
      },
    });
    layer9.value.addTo(initialMap.value);

    //loginexampleModal.value = new bootstrap.Modal(document.getElementById("loginexampleModal")); // creating modal object
    //loginexampleModal.value.show();

  });

  var crosshair = new L.marker(initialMap.value.getCenter(), {
    icon: L.icon({
      iconUrl: '/crosshair.png',
      iconSize: [50, 50], // size of the icon
      iconAnchor: [25, 25], // point of the icon which will correspond to marker's location
    }), clickable: false
  });
  crosshair.addTo(initialMap.value);

  setInterval(() => {
    //var currentPos =initialMap.value.getCenter();
    crosshair.setLatLng(initialMap.value.getCenter());
    /*
    initialMap.value.panTo([
                             currentPos.lat,
                             currentPos.lng
                            ]);
                            */
  }, 250);

  // just trying to test the on movend,
  // it is called after the map is panned or zoomed
  initialMap.value.on("moveend", () => {
   // let databounds = initialMap.value.getBounds();
   // console.log(databounds._southWest.lat); //min lat
   // console.log(databounds._southWest.lng); //min lng
   // console.log(databounds._northEast.lat); //max lat
   // console.log(databounds._northEast.lng); //max lng
   // console.log(initialMap.value.getZoom());
    crosshair.setLatLng(initialMap.value.getCenter());
    gpsStuck.value = false;
  });

  // add hybrid google map tile
  L.tileLayer(googleLayerMap, {
    maxZoom: 30,
  }).addTo(initialMap.value);

  // create a gps marker
  gpsMarker.value[0] = L.circle(
    [11.015566682201666, 123.9924500087559]
    ,
    {
      color: "yellow",
      radius: 5,
      fillColor: "steelblue",
      opacity: 0.5,
    }
  );
  gpsMarker.value[1] = L.marker([11.015566682201666, 123.9924500087559], {
    icon: L.icon({
      iconUrl: "/standing_man.png",
      iconSize: [60, 40], // size of the icon
      shadowSize: [30, 20], // size of the shadow
      iconAnchor: [30, 40], // point of the icon which will correspond to marker's location
      shadowAnchor: [30, 40], // the same for the shadow
    }),
  });
  gpsMarker.value[0].addTo(initialMap.value);
  gpsMarker.value[1].addTo(initialMap.value);

  // monitor the gps position and update the gps marker to correstpond
  // to the current gps location
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition((position) => {
      gps.value = position;
      gpsMarker.value[0].setLatLng(L.latLng(gps.value.coords.latitude, gps.value.coords.longitude));
      gpsMarker.value[1].setLatLng(L.latLng(gps.value.coords.latitude, gps.value.coords.longitude));
    });
  }

  // start of downloading of geoJSON Files
  fetch("/mapassets/map1/map1_cons.geojson")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      rawCustomerData.value = data;
    });

  fetch("/mapassets/map1/map1_subtranspole.geojson")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      rawSubtranspoleData.value = data;
    });

  fetch("/mapassets/map1/map1_pripole.geojson")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      rawPripoleData.value = data;
    });

  fetch("/mapassets/map1/map1_secpole.geojson")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      rawSecpoleData.value = data;
    });

  fetch("/mapassets/map1/map1_secline.geojson")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      rawSeclineData.value = data;
    });

  fetch("/mapassets/map1/map1_priline.geojson")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      rawPrilineData.value = data;
    });

  fetch("/mapassets/map1/map1_distxmer.geojson")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      rawDistxmerData.value = data;
    });

  fetch("/mapassets/map1/map1_subtransline.geojson")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      rawSubtranslineData.value = data;
    });

  fetch("/mapassets/map1/map1_powerxmer.geojson")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      rawSubtransXmerData.value = data;
    });

  fetch("/data/users.json")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      rawUsersData.value = data;
    });
});

//--------------------------------------------------------------------------//
const headTitle = "View Map";
</script>

<template>
<Head v-bind:title="headTitle"></Head>
  <!-- Modal 'Start Loading Data Animation' Exitless Form -->
  <div class="modal fade" data-bs-backdrop="static" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel"
    aria-hidden="true">
    <div class="modal-dialog  modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <img width="30px" src="/favicon.jpg" class="img-fluid rounded-top" alt="" />
          <h5 class="modal-title" id="exampleModalLabel">{{ introWindowTitle }}</h5>
        </div>
        <div class="modal-body">
          <!------------------------ BODY STARTS ----------------------------->
          <img height="30" src="/filetransfer.gif" class="img-fluid" alt="" />
          <div class="spinner-grow text-primary" style="width: 1rem; height: 1rem;" role="status" zv-if="loading">
            <span class="sr-only"></span>
          </div>
          <div class="mt-4 mb-4" zv-if="loading">Retreiving the Distribution System data from the server ...</div>
          <br><br>
          <!------------------------- BODY ENDS ----------------------------->
        </div>
      </div>
    </div>
  </div>

  <!-- Modal 'Login Form' Exitless Form -->
  <div class="modal fade" data-bs-backdrop="static" id="loginexampleModal" tabindex="-1"
    aria-labelledby="loginexampleModalLabel" aria-hidden="true">
    <div class="modal-dialog  modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header gap-2">
          <img width="30px" src="/favicon.jpg" class="img-fluid rounded-top" alt="" />
          <h3 class="modal-title" id="exampleModalLabel">Login</h3>
        </div>
        <div class="modal-body">
          <!------------------------ BODY STARTS ----------------------------->
          <div class="d-flex">
            <span class="text-primary flex gap-2">
              <Icon icon="uim:user-md" width="24" height="24" />Username
            </span>
         </div>
          <input @focus="loginerror = false" type="text" class="form-control" v-model="username" />
          <br>
          <div class="d-flex">
            <span class="text-primary  flex gap-2">
              <Icon icon="carbon:password" width="24" height="24" />Password
            </span>
          </div>
          <input @focus="loginerror = false" type="password" class="form-control" v-model="password" />
          <span v-show="loginerror" class="text-danger">Login Error: Username and password does not match</span>
          <br>
          <button class="btn btn-primary mt-3" style="width: 100px; height: 50px;" @click="login()">
            <div v-show="!loginloading" class="flex gap-2">
              <Icon icon="solar:login-3-outline" width="24" height="24" />
              Login
            </div>
            <div v-show="loginloading" class="spinner-border" style="width: 24px; height: 24px;" role="status">
              <span class="sr-only"></span>
            </div>
          </button>
          <!------------------------- BODY ENDS ----------------------------->
        </div>
      </div>
    </div>
  </div>

  <!-- Modal For Searched List-->
  <div class="modal fade" id="searchHistoryModal" tabindex="-1" aria-labelledby="exampleModalLabel2" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-dark">
          <!------------------------ HEADER STARTS -------------------------->
          <h5 class="flex gap modal-title bg-dark" id="exampleModalLabel2">
            <Icon icon="ic:round-history-edu" width="32px" height="32px" style="color: #3b5fd8" />
            <span class="text-secondary">Search History</span>
          </h5>
          <button type="button" class="btn btn-dark ms-auto p-2 rounded" data-bs-dismiss="modal"
            aria-label="Close">X</button>
          <!------------------------ HEADER ENDS -------------------------->
        </div>
        <div class="modal-body bg-dark">
          <!------------------------ BODY STARTS ----------------------------->
          <div class="container">
            <div class="row row-cols-1 row-cols-sm-3 row-cols-lg-5 g-1 g-lg-2">

              <div class="col" v-for="(searchkey) in searchList" :key="searchkey.id">
                <div class="p-0 border bg-light rounded">
                  <button type="button" @click="searchkeyClick(searchkey.string_value)"
                    class="btn btn-dark text-secondary m-0 w-100 h-100 overflow-auto" data-bs-dismiss="modal">
                    <p><b>{{ searchkey.string_value }}</b></p>
                    <span style="font-size: 10px;" class="flex gap-2">
                      <Icon v-show="searchkey.found" icon="icon-park-outline:success" width="15px" height="15px"
                        style="color: #271bf2" />
                      <Icon v-show="!searchkey.found" icon="ep:failed" width="15px" height="15px"
                        style="color: #eb0d0d" />
                      {{ searchkey.data }}
                    </span>
                  </button>
                </div>
              </div>

            </div>
          </div>
          <!------------------------- BODY ENDS ----------------------------->
        </div>
        <div class="modal-footer  bg-dark">
          <!----------------------- FOOTER STARTS --------------------------->
          <button type="button" @click="clearHistoryClick()" v-show="!showConfirmDelete" class="btn btn-danger">
            <div class="flex gap-2">
                <Icon icon="tdesign:user-clear" width="25px" height="25px" style="color: white" />
                Clear History
            </div>
          </button>
          <div class="input-group flex-grow-1" v-show="showConfirmDelete">
            <input id="dangerinputdeleteall" type="text" class="form-control btn-outline-danger"
              aria-describedby="helpId" placeholder='Type in "delete all" to confirm' v-model="deleteAll" />
            <div class="input-group-append">
              <button type="button" @click="confirmClearClick()" class="btn btn-outline-danger text-white btn-danger">
                <Icon icon="fluent:delete-arrow-back-20-regular" width="25px" height="25px" style="color: #271bf2" />
              </button>
            </div>
          </div>
          <!----------------------- FOOTER ENDS --------------------------->
        </div>
      </div>
    </div>
  </div>

  <!-- Black Navigation Bar with Off Canvas Menu and Map -->
  <div class="position-relative vh-100 vw-100 overflow-hidden">
    <div class="sticky-top bg-dark">
      <!-- Start of Navigaion Bar-->
      <nav class="container navbar navbar-dark bg-dark" aria-label="Dark offcanvas navbar">
        <div class="container fluid">
          <!-- Start of Navigaion Bar Branding Image and name-->
          <a :href="logo_url" target="_blank" style="text-decoration: none;">
            <div class="flex g-2">
              <img width="50px" src="/favicon.jpg" class="rounded mr-3" alt="icon" />
              <span class="navbar-brand ml-3">&nbsp;&nbsp;{{ coopName }}</span>
            </div>
          </a>
          <!-- End of Navigaion Bar Branding Image and name -->
          <!-- Start of Nav Bar Right Button with 3 dadashed lines -->
          <button @click="navbarTogglerClicked()" class="navbar-toggler" type="button" data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasNavbarDark" aria-controls="offcanvasNavbarDark">
            <span class="navbar-toggler-icon"></span>
          </button>
          <!-- End of Nav Bar Right Button wit 3 dadashed lines -->
          <!-- Start of Sliding OffCanvas Menu -->
          <div class="offcanvas offcanvas-end text-bg-dark" tabindex="-1" id="offcanvasNavbarDark"
            aria-labelledby="offcanvasNavbarDarkLabel" data-bs-backdrop="false">
            <div class="offcanvas-header">
              <h5 class="offcanvas-title" id="offcanvasNavbarDarkLabel">
                Activities
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas"
                aria-label="Close"></button>
            </div>
            <div class="offcanvas-body">
              <ul class="navbar-nav justify-content-end flex-grow-1 pe-3">
                <!-- Start of Sliding OffCanvas Menu Items List -->


                <li class="nav-item">
                  <span class="nav-link user-select-none" @click="whereAmILocatedClick()">Where Am I</span>
                </li>
                <li class="nav-item">
                  <span class="nav-link user-select-none" @click="checkoutThisPlace()">Checkout This Place
                  </span>
                </li>
                <li class="nav-item">
                  <span class="nav-link user-select-none" @click="showAllCustomersHere()">Who Are In Here
                  </span>
                </li>
                <li class="nav-item">
                  <span class="nav-link user-select-none" @click="searchHistoryModal()">Show My Search History
                  </span>
                </li>
                <li class="nav-item">
                    <a href="/dashboard" class="nav-link user-select-none"><h5><b> <<< Back to Dashboard</b></h5></a>
                </li>
                <li class="nav-item">
                  <span>___________________________</span>
                </li>

                <!-- Planned
                <li class="nav-item dropdown">
                  <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown"
                    aria-expanded="false">
                    File Download
                  </a>
                  <ul class="dropdown-menu">
                    <li>
                      <span class="dropdown-item user-select-none" @click="whereAmILocatedClick()">
                        As JSON Data
                      </span>
                    </li>
                    <li>
                      <span class="dropdown-item user-select-none" @click="checkoutThisPlace()">
                        As JAEDNS Format
                      </span>
                    </li>
                  </ul>
                </li>

                <li class="nav-item dropdown">
                  <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown"
                    aria-expanded="false">
                    Create Point
                  </a>
                  <ul class="dropdown-menu">
                    <li>
                      <span class="dropdown-item user-select-none" @click="whereAmILocatedClick()">
                        Subtrans Pole
                      </span>
                    </li>
                    <li>
                      <span class="dropdown-item user-select-none" @click="checkoutThisPlace()">
                        Distribution Pole
                      </span>
                    </li>
                    <li>
                      <span class="dropdown-item user-select-none" @click="showAllCustomersHere()">
                        Underbuilt Node
                      </span>
                    </li>
                    <li>
                      <span class="dropdown-item user-select-none" @click="showAllCustomersHere()">
                        Open Secondary Pole
                      </span>
                    </li>
                    <li>
                      <hr class="dropdown-divider" />
                    </li>
                    <li>
                      <span class="dropdown-item user-select-none" @click="searchHistoryModal()">
                        Power Transformer
                      </span>
                    </li>
                    <li>
                      <span class="dropdown-item user-select-none" @click="searchHistoryModal()">
                        AVR
                      </span>
                    </li>
                    <li>
                      <span class="dropdown-item user-select-none" @click="searchHistoryModal()">
                        Capacitor
                      </span>
                    </li>
                    <li>
                      <span class="dropdown-item user-select-none" @click="searchHistoryModal()">
                        Distribution Transformer
                      </span>
                    </li>
                    <li>
                      <hr class="dropdown-divider" />
                    </li>
                    <li>
                      <span class="dropdown-item user-select-none" @click="searchHistoryModal()">
                        Line Metering Point
                      </span>
                    </li>
                    <li>
                      <span class="dropdown-item user-select-none" @click="searchHistoryModal()">
                        Primary Metering Point
                      </span>
                    </li>
                    <li>
                      <span class="dropdown-item user-select-none" @click="searchHistoryModal()">
                        Secondary Metering Point
                      </span>
                    </li>
                    <li>
                      <span class="dropdown-item user-select-none" @click="searchHistoryModal()">
                        Generator Metering Point
                      </span>
                    </li>
                    <li>
                      <hr class="dropdown-divider" />
                    </li>
                    <li>
                      <span class="dropdown-item user-select-none" @click="searchHistoryModal()">
                        Disconnect Switch
                      </span>
                    </li>
                    <li>
                      <span class="dropdown-item user-select-none" @click="searchHistoryModal()">
                        Fuse Cut-out
                      </span>
                    </li>
                    <li>
                      <span class="dropdown-item user-select-none" @click="searchHistoryModal()">
                        Recloser
                      </span>
                    </li>
                    <li>
                      <span class="dropdown-item user-select-none" @click="searchHistoryModal()">
                        Relay/Circuit Breaker
                      </span>
                    </li>
                  </ul>
                </li>

                <li class="nav-item dropdown">
                  <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown"
                    aria-expanded="false">
                    Create Line
                  </a>
                  <ul class="dropdown-menu">
                    <li>
                      <span class="dropdown-item user-select-none" @click="whereAmILocatedClick()">
                        Subtrans Line
                      </span>
                    </li>
                    <li>
                      <span class="dropdown-item user-select-none" @click="checkoutThisPlace()">
                        Medium Voltage
                      </span>
                    </li>
                    <li>
                      <span class="dropdown-item user-select-none" @click="showAllCustomersHere()">
                        Secondary
                      </span>
                    </li>
                    <li>
                      <span class="dropdown-item user-select-none" @click="searchHistoryModal()">
                        Primary Service Drop
                      </span>
                    </li>
                    <li>
                      <span class="dropdown-item user-select-none" @click="searchHistoryModal()">
                        Secondary Service Drop
                      </span>
                    </li>
                  </ul>
                </li>

                <li class="nav-item dropdown">
                  <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown"
                    aria-expanded="false">
                    Search
                  </a>
                  <ul class="dropdown-menu">
                    <li>
                      <span class="dropdown-item user-select-none" @click="whereAmILocatedClick()">
                        Where Am I
                      </span>
                    </li>
                    <li>
                      <span class="dropdown-item user-select-none" @click="checkoutThisPlace()">
                        Checkout This Place
                      </span>
                    </li>
                    <li>
                      <span class="dropdown-item user-select-none" @click="showAllCustomersHere()">
                        Who Are In Here
                      </span>
                    </li>
                    <li>
                      <hr class="dropdown-divider" />
                    </li>
                    <li>
                      <span class="dropdown-item user-select-none" @click="searchHistoryModal()">
                        Show My Search History
                      </span>
                    </li>
                  </ul>
                </li>
                -->
                <!-- Dropdowns

                  -->

                <!-- End of Sliding OffCanvas Menu Items List -->
              </ul>

              <!-- Start of Search Key input and search button -->
              <div class="d-flex mt-3" role="search">
                <input class="form-control me-2" type="search" placeholder="Search Key" aria-label="Search"
                  v-model="customerID" />
                <button class="btn btn-outline-success" @click="customerSearch()">
                  <i class="bi bi-search"></i>
                </button>
              </div>
              <!-- End of Search Key input and search button -->

              <!-- Start of Search Input feedback mechanism -->
              <p class="text-danger">{{ error_message }}</p>
              <div class="flex align-middle" style="width: 100%;">
                <img v-show="loading" style="height: 150px; margin-left: auto; margin-right: auto;" src="/searchingcat.gif" class="img-fluid" alt="" />
              </div>
              <br>
              <div v-show="loading" class="spinner-border mt-3" style="width: 3rem; height: 3rem;" role="status">
                <span class="sr-only"></span>
              </div>
              <div v-show="loading">Searching...</div>
              <!-- End of Search Input feedback mechanism -->
            </div>
          </div>
          <!-- End of Sliding OffCanvas Menu -->
        </div>
      </nav>
    </div>
    <div id="map" style="height: 112vh"></div>
  </div>
</template>

<style lang="scss">
@import 'leaflet/dist/leaflet.css';
@import 'bootstrap/dist/css/bootstrap.css';
@import 'bootstrap-icons/font/bootstrap-icons.css';

* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
#map {
  height: 500px;
}
.leaflet-grab {
  cursor: auto;
}
.leaflet-dragging .leaflet-grab {
  cursor: grabbing;
}

* {
text-align: center;
}

#dangerinputdeleteall {
  &:focus {
    border-color: #FF0000;
    box-shadow: inset 0 1px 1px rgba(107, 44, 44, 0.075), 0 0 20px rgba(255, 0, 0, 0.8);
  }
}
</style>
