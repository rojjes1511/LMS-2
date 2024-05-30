import navbar from "./navbar.js";
import footerr from "./footers.js";

const adminstats = Vue.component("adminstats", {
  template: `
    <div>
      <navbar></navbar>
      <div class="container">
        <h2 class="form-title">Books Issued</h2>
        <div class="chart-container">
          <canvas id="barChart"></canvas>
        </div>
      </div>
      <br>
      <div class="container">
        <h2 class="form-title">Most Demanded Sections</h2>
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
      barChart: null,
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
      fetch("/adminstats", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch stats");
          }
          return response.json();
        })
        .then((data) => {
          this.createBarChart(data);
          this.createPieChart(data);
        })
        .catch((error) => {
          console.error("Error fetching statistics:", error);
        });
    },
    createBarChart(data) {
      const ctx = document.getElementById("barChart").getContext("2d");

      if (this.barChart) {
        this.barChart.destroy();
      }

      this.barChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: Object.keys(data),
          datasets: [
            {
              label: "Books Issued",
              data: Object.values(data),
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
    createPieChart(data) {
      const pieCtx = document.getElementById("pieChart").getContext("2d");

      if (this.pieChart) {
        this.pieChart.destroy();
      }

      const sectionLabels = Object.keys(data);
      const sectionValues = Object.values(data);

      this.pieChart = new Chart(pieCtx, {
        type: "pie",
        data: {
          labels: sectionLabels,
          datasets: [
            {
              label: "Most Demanded Sections",
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

export default adminstats;
