import navbar from "./navbar.js";
import footerr from "./footers.js";

const CreateUser = Vue.component("CreateUser", {
  template: ` <div>
    <navbar></navbar>
    <div class="login-container">
    <div class="paper-form-container">
      <form @submit.prevent="createUser" class="login-form">
        <h2 class="form-title">Register</h2>
        <div v-if="msg" class="alert alert-success" role="alert">
          {{ msg }}
        </div>
        <div v-if="ermsg" class="alert alert-danger" role="alert">
          {{ ermsg }}
        </div>
        <div class="form-group">
          <label for="username">Username</label>
          <input
            v-model="formData.username"
            type="text"
            class="form-control"
            id="username"
            name="username"
            required
          >
          <p class="error" style="color:red;" id="usernameError">{{ usernameError }}</p>
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input
            v-model="formData.email"
            type="email"
            class="form-control"
            id="email"
            name="email"
            required
          >
          <p class="error" style="color:red;" id="emailError">{{ emailError }}</p>
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input
            v-model="formData.password"
            type="password"
            class="form-control"
            id="password"
            name="password"
            @input="validatePassword"
            required
          >
          <p class="error" style="color:red;" id="passwordError">{{ passwordError }}</p>
        </div>
        <div class="reg-btn">
          <input
            type="submit"
            class="submit-button"
            value="Register"
            style="margin-top:10px;"
            :disabled="passwordError!=''"
          >
          <input
              type="reset"
              class="cancel-button"
              value="Reset"
              style="margin-top:10px;"
          >
        </div>
      </form>
      <div class="text-center" style="margin-top:20px;">
        <p>Already have an account? <router-link to="/login">Login</router-link></p>
      </div>
    </div>
    </div>
    <footerr></footerr>
  </div>`,
  components: {
    navbar,
    footerr,
  },
  data() {
    return {
      showmessage: false,
      ermsg: "",
      msg: "",
      showform: true,
      formData: {
        username: "",
        email: "",
        image: "",
        password: "",
        password_confirm: "",
      },
      emailError: "",
      usernameError: "",
      passwordError: "",
    };
  },
  methods: {
    createUser() {
      const data = {
        username: this.formData.username,
        email: this.formData.email,
        image: this.formData.image,
        password: this.formData.password,
      };
      fetch("/registeruser/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else throw new Error("Something went wrong on api server!");
        })
        .then((data) => {
          this.msg = "Registration successful";

          setTimeout(() => {
            this.msg = "";
            this.$router.push("/login");
          }, 3000);
        })
        .catch((error) => {
          this.ermsg = "Registration failed";
          setTimeout(() => {
            this.ermsg = "";
          }, 3000);
        });
    },
    fetchData() {
      fetch(`/createuser/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          this.userdata = data;
        });
    },
    validatePassword() {
      const password = this.formData.password;
      // Check if the password has a length of at least 8 characters and contains at least one digit
      if (password.length < 8 || !/\d/.test(password)) {
        this.passwordError =
          "Password must be at least 8 characters long and contain at least one digit.";
      } else {
        this.passwordError = "";
      }
    },
  },
  watch: {
    "formData.username": function (newVal) {
      this.usernameError = this.userdata.some(
        (user) => user.username === newVal
      )
        ? "Username already exists"
        : "";
    },
    "formData.email": function (newVal) {
      this.emailError = this.userdata.some((user) => user.email === newVal)
        ? "Email already exists"
        : "";
    },
  },
  mounted() {
    this.fetchData();
  },
});

export default CreateUser;
