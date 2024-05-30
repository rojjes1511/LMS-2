// Import Vue.js and required components
import navbar from "./navbar.js";
import footerr from "./footers.js";

// Define the Vue component for librarian status
const librarianStatus = Vue.component("librarianStatus", {
  template: `
    <div>
      <navbar></navbar>
      <div class="container">
        <div class="row">
          <div class="col-md-12">
            <div class="card">
              <div class="card-body">
                <h1>Librarian Status</h1>
                <div class="row">
                  <div class="col-md-6">
                    <div class="card">
                      <div class="card-body">
                        <h2>Current Time</h2>
                        <p>Current time is: <span id="clock">{{ currentTime }}</span></p>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="card">
                      <div class="card-body">
                        <h2>Librarian Stats</h2>
                        <p>Number of returned books: <span id="num-returned">{{ numReturned }}</span></p>
                        <p>Number of approved books: <span id="num-approved">{{ numApproved }}</span></p>
                        <p>Number of pending books: <span id="num-pending">{{ numPending }}</span></p>
                      </div>
                    </div>
                  </div>
                </div>

                <h2>Book Requests</h2>
                <table class="table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Book Name</th>
                      <th>Book Image</th>
                      <th>Live Remaining Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="request in bookRequests" :key="request.id">
                      <td>{{ request.username }}</td>
                      <td>{{ request.bookName }}</td>
                      <td><img :src="request.bookImage" style="max-width: 100px; height: auto;" alt="Book Image"></td>
                      <td>{{ displayRemainingTime(request.remainingTime) }}</td>
                      <td>
                        <button :class="getStatusButtonClass(request.status)" @click="processRequest(request.id)" style="border-radius: 20px; padding: 8px 16px; border: none;">{{ displayAction(request.status) }}</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footerr></footerr>
    </div>
  `,
  components: {
    navbar,
    footerr,
  },
  data() {
    return {
      currentTime: "", // Holds current time
      numReturned: 0, // Number of returned books
      numApproved: 0, // Number of approved books
      numPending: 0, // Number of pending books
      bookRequests: [], // Array to hold book requests data (initialize as empty array)
    };
  },
  mounted() {
    if (!localStorage.getItem("token")) {
      this.$router.push("/login");
    } else {
      this.getCurrentTime(); // Set initial current time
      this.getLibrarianStatus(); // Fetch librarian status data
      // Set interval to update current time every second
      setInterval(() => {
        this.currentTime = this.getCurrentTime();
        this.updateRemainingTime(); // Update remaining time for book requests
      }, 1000);
    }
  },
  methods: {
    getCurrentTime() {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      return `${hours}:${minutes}:${seconds}`;
    },
    getLibrarianStatus() {
      fetch("/l_status", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
        .then((response) => response.json())
        .then((data) => {
          this.numReturned = data.numReturnedBooks;
          this.numApproved = data.numApprovedBooks;
          this.numPending = data.numPendingBooks; // Update number of pending books
          this.bookRequests = data.bookRequests.map((request) => ({
            ...request,
            remainingTime: this.calculateRemainingTime(request.dateReturn),
          }));
        })
        .catch((error) => {
          console.error("Error fetching librarian status:", error);
        });
    },
    calculateRemainingTime(dateReturn) {
      const returnTime = new Date(dateReturn).getTime();
      const currentTime = new Date().getTime();
      return returnTime - currentTime; // Return the difference in milliseconds
    },
    displayRemainingTime(remainingTime) {
      if (remainingTime <= 0) {
        return "Time Completed";
      } else {
        const hours = Math.floor(remainingTime / (1000 * 60 * 60));
        const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
        return `${hours}h ${minutes}m ${seconds}s`;
      }
    },
    displayAction(status) {
      switch (status) {
        case "pending":
          return "Pending";
        case "approved":
          return "Approved";
        case "returned":
          return "Returned";
        case "revoked":
          return "Revoked";
        case "rejected":
          return "Rejected";
        default:
          return "Unknown";
      }
    },
    updateRemainingTime() {
      this.bookRequests.forEach((request) => {
        request.remainingTime = this.calculateRemainingTime(request.dateReturn);
      });
    },
    getStatusButtonClass(status) {
      switch (status) {
        case "pending":
          return "pending-button";
        case "approved":
          return "approved-button";
        case "returned":
          return "returned-button";
        case "revoked":
          return "revoked-button";
        case "rejected":
          return "rejected-button";
        default:
          return "unknown-button";
      }
    },
    processRequest(requestId) {
      console.log("Processing request with ID:", requestId);
      // Implement logic to process the request (e.g., update status)
    },
  },
});

export default librarianStatus;
