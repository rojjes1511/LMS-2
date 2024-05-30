const navbar = Vue.component("navbar", {
  template: `
 

  <div>
  <nav class="navbar navbar-light" style="background-color: #b1a1f7; padding: 10px;">
    <div class="container">
      <!-- Brand logo or text -->
      <router-link to="/" style="text-decoration: none; color: inherit;">
        <h1 style="font-weight: bold; font-size: 24px; margin: 0;">Library</h1>
      </router-link>

      <!-- Navigation links -->
      <div class="d-flex ms-auto">
        <!-- Conditional links based on token and role -->
        <router-link
          v-if="token && role === 'user'"
          to="/"
          style="text-decoration: none; color: white; background-color: #007bff; border-radius: 20px; padding: 8px 16px; margin-right: 8px;"
        >
          Books
        </router-link>

        <router-link
          v-if="token && role === 'user'"
          to="/mybooks"
          style="text-decoration: none; color: white; background-color: #007bff; border-radius: 20px; padding: 8px 16px; margin-right: 8px;"
        >
          My Books
        </router-link>

        <router-link
          v-if="token && role === 'librarian'"
          to="/librarian"
          style="text-decoration: none; color: white; background-color: #007bff; border-radius: 20px; padding: 8px 16px; margin-right: 8px;"
        >
          Dashboard
        </router-link>

        <router-link
          v-if="token && role === 'librarian'"
          to="/requests"
          style="text-decoration: none; color: white; background-color: #007bff; border-radius: 20px; padding: 8px 16px; margin-right: 8px;"
        >
          Requests
        </router-link>
        <router-link
          v-if="token && role === 'librarian'"
          to="/l_status"
          style="text-decoration: none; color: white; background-color: #E5CA43; border-radius: 20px; padding: 8px 16px; margin-right: 8px;"
        >
          Status
        </router-link>
        <router-link
          v-if="token && role === 'user'"
          to="/u_status"
          style="text-decoration: none; color: white; background-color: #007bff; border-radius: 20px; padding: 8px 16px; margin-right: 8px;"
        >
          Status
        </router-link>
        <router-link
          v-if="token && role === 'user'"
          to="/userstats"
          style="text-decoration: none; color: white; background-color: #007bff; border-radius: 20px; padding: 8px 16px; margin-right: 8px;"
        >
          Stats
        </router-link>

        <router-link
          v-if="token && role === 'librarian'"
          to="/adminstats"
          style="text-decoration: none; color: white; background-color: #007bff; border-radius: 20px; padding: 8px 16px; margin-right: 8px;"
        >
          Stats
        </router-link>

        <router-link
          v-if="!token"
          to="/login"
          style="text-decoration: none; color: white; background-color: #007bff; border-radius: 20px; padding: 8px 16px; margin-right: 8px;"
        >
          Login/Register
        </router-link>

        <!-- Logout button -->
        <button
          v-if="token"
          @click="logout"
          style="text-decoration: none; color: white; background-color: #D31A00 ; border-radius: 20px; padding: 8px 16px; margin-right: 8px;"
        >
          <i class="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>
    </div>
  </nav>
</div>

      `,
  data() {
    return {
      token: localStorage.getItem("token") || "",
      role: localStorage.getItem("role") || "",
    };
  },
  methods: {
    logout() {
      // Perform logout actions and remove the token from localStorage
      fetch("/userlogout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + this.token,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Logout failed.");
          } else {
            return response.json();
          }
        })
        .then((data) => {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          this.token = "";
          this.$router.push("/login");
          location.reload();
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
});

export default navbar;
