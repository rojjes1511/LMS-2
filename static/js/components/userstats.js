import navbar from "./navbar.js";
import footerr from "./footers.js";

const userstats = Vue.component("userstats", {
  template: `
    <div>
      <navbar></navbar>
      <div class="container">
        <h2 class="form-title">Books Stats</h2>
        <div class="chart-container">
          <canvas id="barChart"></canvas>
        </div>
      </div>
      <br>
      <div class="container">
        <h2 class="form-title">Section Stats</h2>
        <div class="chart-container">
          <canvas id="pieChart"></canvas>
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
      cdict: {},
      chart: null,
      pieChart: null,
    };
  },
  mounted() {
    if (!localStorage.getItem("token")) {
      this.$router.push("/login");
    } else {
      this.getStats();
    }
  },
  methods: {
    getStats() {
      fetch("/userstats", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Stats fetch failed");
          }
          return response.json();
        })
        .then((data) => {
          this.cdict = data;
          this.createBarChart();
          this.createPieChart();
        })
        .catch((error) => {
          console.error("Error fetching user statistics:", error);
        });
    },
    createBarChart() {
      const ctx = document.getElementById("barChart").getContext("2d");

      if (this.chart) {
        this.chart.destroy(); // Destroy existing chart instance
      }

      this.chart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: Object.keys(this.cdict),
          datasets: [
            {
              label: "Returned Books",
              data: Object.values(this.cdict),
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    },
    createPieChart() {
      const pieCtx = document.getElementById("pieChart").getContext("2d");

      if (this.pieChart) {
        this.pieChart.destroy(); // Destroy existing pie chart instance
      }

      const sectionLabels = Object.keys(this.cdict);
      const sectionValues = Object.values(this.cdict);

      this.pieChart = new Chart(pieCtx, {
        type: "pie",
        data: {
          labels: sectionLabels,
          datasets: [
            {
              label: "No. of Requested Books by this Sections",
              data: sectionValues,
              backgroundColor: [
                "#FF6384",
                "#36A2EB",
                "#FFCE56",
                "#4BC0C0",
                "#9966FF",
                "#FF9F40",
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    },
  },
});

export default userstats;
