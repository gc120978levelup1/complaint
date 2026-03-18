
<script setup lang="ts">
//--------------------------------------------------------------------------//
const googleLayerMap = "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}";
const initialMapZoom = 19;
const coopMainCoordinates = [11.0155, 123.9924];        // ylat, xlon format
//--------------------------------------------------------------------------//

import { Head } from '@inertiajs/vue3';
import * as L from "leaflet";

import { Search, LocateFixed, UtilityPole, Gauge, FileClock, RefreshCw } from 'lucide-vue-next';
import { uid } from "uid";
import { ref, onMounted } from "vue";

import AppContent from '@/components/AppContent.vue';
import AppShell from '@/components/AppShell.vue';
import AppSidebar from '@/components/AppSidebar.vue';





import Breadcrumbs from '@/components/Breadcrumbs.vue';
import { Button } from '@/components/ui/button';

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import mem from '@/extra/gboi.js';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
];

const showConfirmDelete = ref(null);
const deleteAll = ref(null);
const searchList = ref([]);
const error_message = ref(null);
const loading = ref(false);
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

const confirmClearClick = () => {
    if (!showConfirmDelete.value) {
        showConfirmDelete.value = true;
    } else {
        showConfirmDelete.value = false;

        if (deleteAll.value === "delete all") {
            while (searchList.value.length > 0) {
                searchList.value.pop();
            }

            searchList.value = [];
        }
    }
};

const listOfCustomerFeatures = () => {
    rawSavedCustomerFeaturesData.value = [];
    for (var i = 0; i < rawCustomerData.value.features.length; i++) {
        rawSavedCustomerFeaturesData.value.push(rawCustomerData.value.features[i]);
    }
    filteredCustomerData.value = rawCustomerData.value;
    filteredCustomerData.value.features = [];
    var foundFeatureGeometry = null;
    for (i = 0; i < rawSavedCustomerFeaturesData.value.length; i++) {
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
        for (i = 0; i < rawSavedCustomerFeaturesData.value.length; i++) {
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
        for (i = 0; i < rawSeclineData.value.features.length; i++) {
            rawSavedSeclineFeaturesData.value.push(rawSeclineData.value.features[i]);
        }
        rawSeclineData.value.features = [];
        for (i = 0; i < rawSavedSeclineFeaturesData.value.length; i++) {
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
        for (i = 0; i < rawSecpoleData.value.features.length; i++) {
            rawSavedSecpoleFeaturesData.value.push(rawSecpoleData.value.features[i]);
        }
        rawSecpoleData.value.features = [];
        for (i = 0; i < rawSavedSecpoleFeaturesData.value.length; i++) {
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
        for (i = 0; i < rawPrilineData.value.features.length; i++) {
            rawSavedPrilineFeaturesData.value.push(rawPrilineData.value.features[i]);
        }
        rawPrilineData.value.features = [];
        for (i = 0; i < rawSavedPrilineFeaturesData.value.length; i++) {
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
        for (i = 0; i < rawPripoleData.value.features.length; i++) {
            rawSavedPripoleFeaturesData.value.push(rawPripoleData.value.features[i]);
        }
        rawPripoleData.value.features = [];
        for (i = 0; i < rawSavedPripoleFeaturesData.value.length; i++) {
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
        for (i = 0; i < rawDistxmerData.value.features.length; i++) {
            rawSavedDistxmerFeaturesData.value.push(
                rawDistxmerData.value.features[i]
            );
        }
        rawDistxmerData.value.features = [];
        for (i = 0; i < rawSavedDistxmerFeaturesData.value.length; i++) {
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
    for (var i = 0; i < rawCustomerData.value.features.length; i++) {
        rawSavedCustomerFeaturesData.value.push(rawCustomerData.value.features[i]);
    }
    filteredCustomerData.value = rawCustomerData.value;
    filteredCustomerData.value.features = [];

    var foundPriFeatureGeometry = null;
    var foundSecFeatureGeometry = null;

    for (i = 0; i < rawSecpoleData.value.features.length; i++) {
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
    for (i = 0; i < rawPripoleData.value.features.length; i++) {
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
        for (i = 0; i < rawSavedCustomerFeaturesData.value.length; i++) {
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
        for (i = 0; i < rawSeclineData.value.features.length; i++) {
            rawSavedSeclineFeaturesData.value.push(rawSeclineData.value.features[i]);
        }
        rawSeclineData.value.features = [];
        for (i = 0; i < rawSavedSeclineFeaturesData.value.length; i++) {
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
        for (i = 0; i < rawSecpoleData.value.features.length; i++) {
            rawSavedSecpoleFeaturesData.value.push(rawSecpoleData.value.features[i]);
        }
        rawSecpoleData.value.features = [];
        for (i = 0; i < rawSavedSecpoleFeaturesData.value.length; i++) {
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
        for (i = 0; i < rawPrilineData.value.features.length; i++) {
            rawSavedPrilineFeaturesData.value.push(rawPrilineData.value.features[i]);
        }
        rawPrilineData.value.features = [];
        for (i = 0; i < rawSavedPrilineFeaturesData.value.length; i++) {
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
        for (i = 0; i < rawPripoleData.value.features.length; i++) {
            rawSavedPripoleFeaturesData.value.push(rawPripoleData.value.features[i]);
        }
        rawPripoleData.value.features = [];
        for (i = 0; i < rawSavedPripoleFeaturesData.value.length; i++) {
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
        for (i = 0; i < rawDistxmerData.value.features.length; i++) {
            rawSavedDistxmerFeaturesData.value.push(
                rawDistxmerData.value.features[i]
            );
        }
        rawDistxmerData.value.features = [];
        for (i = 0; i < rawSavedDistxmerFeaturesData.value.length; i++) {
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
    for (i = 0; i < rawDistxmerData.value.features.length; i++) {
        let feature = rawDistxmerData.value.features[i];
        if (feature.properties)
            if (feature.properties.JAEDType)
                if (
                    feature.properties.JAEDType === "DistXmer" &&
                    (feature.properties.Serial === customerID.value ||
                        feature.properties.XmerID === customerID.value ||
                        feature.properties.CoopID === customerID.value)
                ) {
                    foundDistxmerFeatureGeometry = feature.geometry;
                    let tempMarker = L.marker([
                        foundDistxmerFeatureGeometry.coordinates[1],
                        foundDistxmerFeatureGeometry.coordinates[0],
                    ]).addTo(initialMap.value);
                    let popup = L.popup().setContent(
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
        for (var i = 0; i < rawCustomerData.value.features.length; i++) {
            rawSavedCustomerFeaturesData.value.push(
                rawCustomerData.value.features[i]
            );
        }
        filteredCustomerData.value = rawCustomerData.value;
        filteredCustomerData.value.features = [];
        for (i = 0; i < rawSavedCustomerFeaturesData.value.length; i++) {
            let feature = rawSavedCustomerFeaturesData.value[i];
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
        for (i = 0; i < rawSeclineData.value.features.length; i++) {
            rawSavedSeclineFeaturesData.value.push(rawSeclineData.value.features[i]);
        }
        rawSeclineData.value.features = [];
        for (i = 0; i < rawSavedSeclineFeaturesData.value.length; i++) {
            let feature = rawSavedSeclineFeaturesData.value[i];
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
        for (i = 0; i < rawSecpoleData.value.features.length; i++) {
            rawSavedSecpoleFeaturesData.value.push(rawSecpoleData.value.features[i]);
        }
        rawSecpoleData.value.features = [];
        for (i = 0; i < rawSavedSecpoleFeaturesData.value.length; i++) {
            let feature = rawSavedSecpoleFeaturesData.value[i];
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
        for (i = 0; i < rawPrilineData.value.features.length; i++) {
            rawSavedPrilineFeaturesData.value.push(rawPrilineData.value.features[i]);
        }
        rawPrilineData.value.features = [];
        for (i = 0; i < rawSavedPrilineFeaturesData.value.length; i++) {
            let feature = rawSavedPrilineFeaturesData.value[i];
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
        for (i = 0; i < rawPripoleData.value.features.length; i++) {
            rawSavedPripoleFeaturesData.value.push(rawPripoleData.value.features[i]);
        }
        rawPripoleData.value.features = [];
        for (i = 0; i < rawSavedPripoleFeaturesData.value.length; i++) {
            let feature = rawSavedPripoleFeaturesData.value[i];
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
        for (i = 0; i < rawDistxmerData.value.features.length; i++) {
            rawSavedDistxmerFeaturesData.value.push(
                rawDistxmerData.value.features[i]
            );
        }
        rawDistxmerData.value.features = [];
        for (i = 0; i < rawSavedDistxmerFeaturesData.value.length; i++) {
            let feature = rawSavedDistxmerFeaturesData.value[i];
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
    for (var i = 0; i < rawSubtranspoleData.value.features.length; i++) {
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

const whereAmILocatedClick = () => {
    //loading.value = true;
    setTimeout(whereAmILocatedClick1, 200);
}

const whereAmILocatedClick1 = () => {
    gpsStuck.value = true;

    if (initialMap.value && gps.value) {
        initialMap.value.flyTo([gps.value.coords.latitude, gps.value.coords.longitude], 18);
    }
    //closeOffCanvasMenu();
    //loading.value = false;
};

const checkIfAllDataAreDownloaded = (afterDataIsLoaded) => {
    loading.value = true;
    //check if all the geojson file is done downloading
    const refreshIntervalId = setInterval(() => {
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
                if (afterDataIsLoaded) {
                    afterDataIsLoaded();
                }

                loading.value = false;
            }, 2000);
        }
    }, 500);
};

const checkoutThisPlace = () => {
    loading.value = true;
    setTimeout(checkoutThisPlace1, 100);
};

const checkoutThisPlace1 = () => {
    var databounds = initialMap.value.getBounds();
    rawSavedSeclineFeaturesData.value = [];
    for (var i = 0; i < rawSeclineData.value.features.length; i++) {
        rawSavedSeclineFeaturesData.value.push(rawSeclineData.value.features[i]);
    }
    rawSeclineData.value.features = [];
    for (i = 0; i < rawSavedSeclineFeaturesData.value.length; i++) {
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
    for (i = 0; i < rawSecpoleData.value.features.length; i++) {
        rawSavedSecpoleFeaturesData.value.push(rawSecpoleData.value.features[i]);
    }
    rawSecpoleData.value.features = [];
    for (i = 0; i < rawSavedSecpoleFeaturesData.value.length; i++) {
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
    for (i = 0; i < rawPrilineData.value.features.length; i++) {
        rawSavedPrilineFeaturesData.value.push(rawPrilineData.value.features[i]);
    }
    rawPrilineData.value.features = [];
    for (i = 0; i < rawSavedPrilineFeaturesData.value.length; i++) {
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
    for (i = 0; i < rawPripoleData.value.features.length; i++) {
        rawSavedPripoleFeaturesData.value.push(rawPripoleData.value.features[i]);
    }
    rawPripoleData.value.features = [];
    for (i = 0; i < rawSavedPripoleFeaturesData.value.length; i++) {
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
    for (i = 0; i < rawDistxmerData.value.features.length; i++) {
        rawSavedDistxmerFeaturesData.value.push(rawDistxmerData.value.features[i]);
    }
    rawDistxmerData.value.features = [];
    for (i = 0; i < rawSavedDistxmerFeaturesData.value.length; i++) {
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
};

const showAllCustomersHere = () => {
    loading.value = true;
    setTimeout(showAllCustomersHere1, 100);
};

const showAllCustomersHere1 = () => {
    const databounds = initialMap.value.getBounds();
    rawSavedCustomerFeaturesData.value = [];

    for (let i = 0; i < rawCustomerData.value.features.length; i++) {
        rawSavedCustomerFeaturesData.value.push(rawCustomerData.value.features[i]);
    }

    filteredCustomerData.value = rawCustomerData.value;
    filteredCustomerData.value.features = [];

    for (let i = 0; i < rawSavedCustomerFeaturesData.value.length; i++) {
        const feature = rawSavedCustomerFeaturesData.value[i];
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

            if (latlng) {
                return L.circleMarker(latlng, {
                    radius: 6,
                    fillColor: "#ff7800",
                    color: "yellow",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.9,
                });
            }

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
    customerSearch();
};

const customerSearch1 = () => {
    let searchIsUnique = true;
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

onMounted(() => {
    // register variables to be saved and retreived internally
    mem.register("garrycachi_searchList", searchList);
    mem.register("garrycachi_customerID", customerID);

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

        const pos = initialMap.value._map._latLngToNewLayerPoint(
            initialMap.value._latlng,
            e.zoom,
            e.center
        ),
            anchor = initialMap.value._getAnchor();
        L.DomUtil.setPosition(initialMap.value._container, pos.add(anchor));
    };

    // add hybrid google map tile
    L.tileLayer(googleLayerMap, {
        maxZoom: 30,
    }).addTo(initialMap.value);

    const crosshair = new L.marker(initialMap.value.getCenter(), {
        icon: L.icon({
            iconUrl: 'crosshair.png',
            iconSize: [50, 50], // size of the icon
            iconAnchor: [25, 25], // point of the icon which will correspond to marker's location
        }), clickable: false
    });
    crosshair.addTo(initialMap.value);

    setInterval(() => {
        //var currentPos =initialMap.value.getCenter();
        crosshair.setLatLng(initialMap.value.getCenter());
    }, 250);

    // just trying to test the on movend,
    // it is called after the map is panned or zoomed
    initialMap.value.on("moveend", () => {
        const databounds = initialMap.value.getBounds();
        console.log(databounds._southWest.lat); //min lat
        console.log(databounds._southWest.lng); //min lng
        console.log(databounds._northEast.lat); //max lat
        console.log(databounds._northEast.lng); //max lng
        console.log(initialMap.value.getZoom());
        crosshair.setLatLng(initialMap.value.getCenter());
        gpsStuck.value = false;
    });

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
                        iconUrl: "powerxmer.png",
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
            iconUrl: "standing_man.png",
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
    fetch("mapassets/map1/map1_cons.geojson")
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            rawCustomerData.value = data;
        });

    fetch("mapassets/map1/map1_subtranspole.geojson")
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            rawSubtranspoleData.value = data;
        });

    fetch("mapassets/map1/map1_pripole.geojson")
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            rawPripoleData.value = data;
        });

    fetch("mapassets/map1/map1_secpole.geojson")
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            rawSecpoleData.value = data;
        });

    fetch("mapassets/map1/map1_secline.geojson")
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            rawSeclineData.value = data;
        });

    fetch("mapassets/map1/map1_priline.geojson")
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            rawPrilineData.value = data;
        });

    fetch("mapassets/map1/map1_distxmer.geojson")
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            rawDistxmerData.value = data;
        });

    fetch("mapassets/map1/map1_subtransline.geojson")
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            rawSubtranslineData.value = data;
        });

    fetch("mapassets/map1/map1_powerxmer.geojson")
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            rawSubtransXmerData.value = data;
        });

    fetch("data/users.json")
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            rawUsersData.value = data;
        });

});

</script>

<template>

    <Head title="Dashboard"></Head>

    <div v-show="loading" class="absolute top-0 flex w-full h-full bg-gray-950 z-6000 opacity-97">
        <span class="m-auto animate-spin">
            <RefreshCw :size="60" />
        </span>
    </div>
    <AppShell variant="sidebar">
        <AppSidebar />
        <AppContent variant="sidebar" class="overflow-x-hidden">
            <header
                class="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/70 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
                <div class="flex items-center gap-2 w-full">
                    <SidebarTrigger class="-ml-1" />
                    <template v-if="breadcrumbs && breadcrumbs.length > 0">
                        <Breadcrumbs :breadcrumbs="breadcrumbs" />
                    </template>
                    <div class="flex gap-1 ml-auto">

                        <!-- Menu Buttons in top lef AppBar Start -->
                        <Button class=" bg-gray-900 text-blue-200 hover:bg-gray-800" @click="whereAmILocatedClick()">
                            <LocateFixed />
                        </Button>
                        <Button class=" bg-gray-900 text-blue-200 hover:bg-gray-800" @click="checkoutThisPlace()">
                            <UtilityPole />
                        </Button>
                        <Button class=" bg-gray-900 text-blue-200 hover:bg-gray-800" @click="showAllCustomersHere()">
                            <Gauge />
                        </Button>
                        <Dialog class="z-4000">
                            <DialogTrigger as-child>
                                <Button class=" bg-gray-900 text-blue-200 hover:bg-gray-800">
                                    <FileClock />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Search History
                                    </DialogTitle>
                                    <DialogDescription>
                                        Lists of past searches ...
                                    </DialogDescription>
                                </DialogHeader>
                                <!------------------------ BODY STARTS ----------------------------->
                                <div
                                    class="w-[100%] max-h-[300px] overflow-auto grid grid-flow-row-dense grid-cols-4 gap-2">

                                    <div v-for="(searchkey) in searchList" :key="searchkey.id">
                                        <div class="p-0 border bg-light rounded">
                                            <DialogClose as-child>
                                                <Button @click="searchkeyClick(searchkey.string_value)"
                                                    class="bg-gray-900 text-blue-200 hover:bg-gray-800 flex-col p-3">
                                                    <p><b>{{ searchkey.string_value }}</b></p>
                                                    <span style="font-size: 10px;">
                                                        {{ searchkey.data }}
                                                    </span>
                                                </Button>
                                            </DialogClose>
                                        </div>
                                    </div>

                                </div>
                                <!------------------------- BODY ENDS ----------------------------->
                                <DialogFooter>
                                    <Input class=" shadow-red-800" v-show="showConfirmDelete" v-model="deleteAll"
                                        placeholder='Type in "delete all" to confirm'></Input>
                                    <Button variant="destructive" @click="confirmClearClick()">
                                        Clear All
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <div class="flex ml-2">
                            <Button class=" rounded-2xl rounded-r-none bg-gray-900 text-blue-200 hover:bg-gray-800"
                                @click="customerSearch()">
                                <Search />
                            </Button>
                            <Input class=" rounded-l-none" placeholder="Search" v-model="customerID" />
                        </div>
                        <!-- Menu Buttons in top lef AppBar Ended -->

                    </div>
                </div>
            </header>

            <div class="flex z-50 h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div
                    class="z-150 min-h-screen flex-1 rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">

                    <!-- Main Content Start -->
                    <div id="map" style="height: 100%; background-color: beige;" class="rounded-xl"></div>
                    <!-- Main Content Ended -->

                </div>
            </div>

        </AppContent>
    </AppShell>

</template>
