import navbar from "./navbar.js";
import footerr from "./footers.js";
const Login = Vue.component("login", {
  template: `
    <div>
    <navbar></navbar>
    <div class="login-container">
    <!-- Token-based login form -->
    <div v-if="showloginform" class="paper-form-container">
      <h2 class="form-title">Login</h2>
      <div v-if="showmessage" class="alert alert-danger" role="alert">
        {{ msg }}
      </div>
      <form @submit.prevent="login" class="login-form">
        <!-- Form fields -->
        <div class="mb-3">
          <label for="admin_name" class="form-label">Username</label>
          <input
            type="text"
            class="form-control"
            id="username"
            name="username"
            v-model="username"
            required
          />
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">Password</label>
          <input
            type="password"
            class="form-control"
            id="password"
            name="password"
            v-model="password"
            required
          />
        </div>

        <div class="text-center">
          <button type="submit" class="submit-button"
          style="border-radius: 21px; padding: 10px; margin: 5px; background-color: #4CAF50; color: white; border: none; cursor: pointer;">Login</button>
        </div>
      </form>
      <div class="text-center" style="margin-top:20px;">
        <p>Don't have an account? <router-link to="/register">Register</router-link></p>
        <p>Forgot password? <button style="background: none; border: none; color: #007bff; cursor: pointer; text-decoration: underline;" @click="showreset">Click here</button></p>
      </div>
    </div>
    <div v-if="isRestModalVisible" class="custom-modal-overlay">
    <div class="custom-modal">
      <div class="modal-header">
        <h5 class="modal-title">Update Password</h5>
        <span @click="closeRModal" class="close-btn">&times;</span>
      </div>
      <div class="modal-body">
        <form @submit.prevent="resetpassword">
          <title>Reset Password</title>
          <label for="email" class="form-label form-lable-update">Email:</label>
          <input type="email" class="form-control" placeholder="Email" v-model="formData.email" required>
          <button type="submit" class="submit-button" style="margin-top:10px;"
          style="border-radius: 21px; padding: 10px; margin: 5px; background-color: #4CAF50; color: white; border: none; cursor: pointer;">Reset</button>
          <button type="button" @click="closeRModal" class="cancel-button"
          style="border-radius: 21px; padding: 10px; margin: 5px; background-color: #f44336; color: white; border: none; cursor: pointer;">Cancel</button>
        </form>
      </div>
    </div>
  </div>
    <div v-if="isModalVisible" class="custom-modal-overlay">
        <div class="custom-modal">
          <div class="modal-header">
            <h5 class="modal-title">Update Password</h5>
            <span @click="closeModal" class="close-btn">&times;</span>
          </div>
          <div class="modal-body">
            <form @submit.prevent="updateprofilepassword">
              <title>Update Password</title>
              <label for="otp" class="form-label form-lable-update">Verification code:</label>
              <input type="text" class="form-control" placeholder="Verification code" v-model="userotp" required>
              <label for="password" class="form-label form-lable-update">New Password:</label>
              <input type="password" class="form-control" @input="validatePassword" placeholder="Password" v-model="formData.password" required>
              <p class="error" style="color:red;" id="passwordError">{{ passwordError }}</p>
              <label for="confirm_password" class="form-label form-lable-update">Confirm Password:</label>
              <input type="password" class="form-control" placeholder="Confirm Password" v-model="formData.confirm_password" required>
              <button type="submit" class="submit-button" :disabled="passwordError!=''" style="margin-top:10px; border-radius: 21px;">Update</button>
              <button type="button" @click="closeModal" class="cancel-button"
              style="border-radius: 21px; padding: 10px; margin: 5px; background-color: #f44336; color: white; border: none; cursor: pointer;">Cancel</button>
            </form>
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
      showroute: true,
      showmessage: false,
      msg: "",
      create: false,
      username: "",
      password: "",
      authenticated: false,
      showloginform: true,
      passwordError: "",
      userotp: "",
      otp: "",
      formData: {
        email: "",
        password: "",
        confirm_password: "",
      },
      isModalVisible: false,
      isRestModalVisible: false,
    };
  },

  methods: {
    resetpassword() {
      fetch(`/resetpassword`, {
        method: "POST",
        body: JSON.stringify(this.formData),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("No user found");
          }
        })
        .then((data) => {
          if (data.message == "No user found!") {
            alert("No user found");
            return;
          } else {
            this.otp = data.otp;
            alert("Reset code sent to your email");
            this.closeRModal();
            this.isModalVisible = true;
          }
        })
        .catch((error) => {
          alert("Password reset failed");
          this.user = {};
        });
    },
    closeRModal() {
      // Hide the modal when the "Cancel" button is clicked
      this.isRestModalVisible = false;
    },
    closeModal() {
      // Hide the modal when the "Cancel" button is clicked
      this.isModalVisible = false;
    },
    updateprofilepassword() {
      if (this.userotp != this.otp) {
        alert("Invalid Verification code");
        return;
      }
      if (this.formData.password != this.formData.confirm_password) {
        alert("Passwords do not match");
        return;
      }

      fetch(`/resetpassword`, {
        method: "PUT",
        body: JSON.stringify(this.formData),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("No user found");
          }
        })
        .then((data) => {
          if (data.message == "No user found!") {
            alert("No user found");
            return;
          } else {
            this.formData.email = "";
            this.formData.password = "";
            this.formData.confirm_password = "";
            this.userotp = "";
            alert("Password updated successfully");
            this.closeModal();
          }
        })
        .catch((error) => {
          alert("Password update failed");
        });
    },
    showreset() {
      // Show the modal when the "Update" button is clicked
      this.isRestModalVisible = true;
    },
    showUploadForm() {
      // Show the modal when the "Update" button is clicked
      this.isModalVisible = true;
    },
    login() {
      const payload = {
        username: this.username,
        password: this.password,
      };
      fetch("/userlogin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Invalid Username/password");
          }
        })
        .then((data) => {
          if (data.message == "No user found!") {
            this.showmessage = true;
            setTimeout(() => {
              this.showmessage = false;
            }, 3000);
            this.msg = data.message;
          }
          if (data.message == "Wrong Password") {
            this.showmessage = true;
            setTimeout(() => {
              this.showmessage = false;
            }, 3000);
            this.msg = data.message;
          } else {
            if (data.token) {
              localStorage.setItem("token", data.token);
              localStorage.setItem("role", data.role);
              if (data.role == "admin") {
                this.$router.push("/admin");
              }
              if (data.role == "librarian") {
                this.$router.push("/librarian");
              }
              if (data.role == "user") {
                this.$router.push("/");
              }
            }
          }
        })
        .catch((error) => {
          this.showmessage = true;
          setTimeout(() => {
            this.showmessage = false;
          }, 3000);
          this.msg = "Invalid Username/password";
          console.error(error);
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
});

export default Login;
