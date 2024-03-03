const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();

exports.fileGST = functions.firestore
  .document("bookings/{documentId}")
  .onUpdate(async (change, context) => {
    const newValue = change.after.data();
    const oldValue = change.before.data();

    // Check if the status field has changed to 'finished'
    if (newValue.status === "finished" && oldValue.status !== "finished") {
      const name = newValue.name;
      const totalBookingAmount = newValue.totalBookingAmount;

      // Calculate GST
      const gstRate = 0.18; // Assuming a predefined GST slab rate of 18%
      const gstAmount = totalBookingAmount * gstRate;
      const igst = gstAmount;
      const sgstCgst = gstAmount / 2;
      const gstNumber = '21AAACC1206D2ZR'; // Hardcoded GST number

      // Call the GST API to file the GST
      const options = {
        method: 'GET',
        url: 'https://gst-details-filing-data.p.rapidapi.com/gst/',
        params: {
          GSTIN: gstNumber
        },
        headers: {
          'X-RapidAPI-Key': '720f5878cdmsh75b3ac0d939ac89p16b3a7jsn93d30602bd68',
          'X-RapidAPI-Host': 'gst-details-filing-data.p.rapidapi.com'
        }
      };

      try {
        const response = await axios.request(options);
        console.log(response.data);

        // Create a new invoice document with the calculated values
        await admin.firestore().collection("invoices").add({
          name,
          totalBookingAmount,
          igst: igst,
          sgstCgst: sgstCgst,
          status: "pending",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Update the status of the booking document
        return change.after.ref.set({ status: "processed" }, { merge: true });
      } catch (error) {
        console.error(error);
        return null; // Return null to indicate an error occurred
      }
    }
    return null; // Return null if the status is not 'finished'
  });
