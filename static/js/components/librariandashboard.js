import navbar from "./navbar.js";
import footerr from "./footers.js";

const librariandasboard = Vue.component("librariandasboard", {
  template: `
        <div>
        <navbar></navbar>
            <div class="container">
            <h2>Sections</h2>
            <div class="section-container" v-if="noSection">
                <h3>No Section Available</h3>
            </div>
            <div class="section-container" v-else>
            <div class="section" v-for="section in sectionData">
                <img :src="section.image" alt="section image" class="section-image" @click="$router.push('/book/'+section.id)">
                <h3>{{section.name}}</h3>
                <p>{{section.description}}</p>
                <p>{{ formatDate(section.dateCreated) }}</p>
                
                <div class="edit-delete-buttons">
                    <button class="submit-button" @click="editSection(section)"
                    style="border-radius: 21px; padding: 10px; margin: 5px; background-color: #4CAF50; color: white; border: none; cursor: pointer;">Edit</button>
                    <button class="cancel-button" @click="deleteSection(section.id)"
                    style="border-radius: 21px; padding: 10px; margin: 5px; background-color: #f44336; color: white; border: none; cursor: pointer;" >Delete</button>
                </div>
            </div>
            </div>
            <button class="submit-button" @click="addSection"
            style="border-radius: 21px; padding: 10px; margin: 5px; background-color: #4CAF50; color: white; border: none; cursor: pointer;">Add Section</button>
            
            <div class="model" v-if="showSectionForm">
                <div  class="paper1-form-container">
                    <h2 class="form-title">Add Section</h2>
                    <form @submit.prevent="SubmitSection" class="login-form">
                        <div class="mb-3">
                        <label for="section_name" class="form-label
                        ">Section Name</label>
                        <input type="text" class="form-control" id="section_name" name="section_name" v-model="section_name" required>
                        </div>
                        <div class="mb-3">
                        <label for="dateCreated" class="form-label">Date Created</label>
                        <input type="date" class="form-control" id="dateCreated" name="dateCreated" v-model="dateCreated" required>
                        </div>
                        <div class="mb-3">
                        <label for="description" class="form-label">Description</label>
                        <textarea class="form-control" id="description" name="description" v-model="description" required></textarea>
                        </div>
                        <div class="mb-3">
                        <label for="sectionImage" class="form-label
                        ">Section Image</label>
                        <input type="file" class="form-control" id="sectionImage" name="sectionImage" 
                        @change="uploadImage"
                         required>
                        </div>
                        <div class="text-center">
                        <button type="submit" class="submit-button"
                        style="border-radius: 21px; padding: 10px; margin: 5px; background-color: #4CAF50; color: white; border: none; cursor: pointer;">Add</button>
                        <button type="button" class="cancel-button" @click="addSection"
                        style="border-radius: 21px; padding: 10px; margin: 5px; background-color: #f44336; color: white; border: none; cursor: pointer;">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
            <div class="model" v-if="showeditSectionForm">
                <div  class="paper1-form-container">
                    <h2 class="form-title">Edit Section</h2>
                    <form @submit.prevent="submiteditSection" class="login-form">
                        <div class="mb-3">
                        <label for="section_name" class="form-label
                        ">Section Name</label>
                        <input type="text" class="form-control" id="section_name" name="section_name" v-model="section_name">
                        </div>
                        <div class="mb-3">
                        <label for="dateCreated" class="form-label">Date Created</label>
                        <input type="date" class="form-control" id="dateCreated" name="dateCreated" v-model="dateCreated" required>
                        </div>
                        <div class="mb-3">
                        <label for="description" class="form-label">Description</label>
                        <textarea class="form-control" id="description" name="description" v-model="description"></textarea>
                        </div>
                        <div class="mb-3">
                        <label for="sectionImage" class="form-label
                        ">Section Image</label>
                        <img :src="sectionImage" alt="section image" class="section-image" width="50" height="50">
                        <input type="file" class="form-control" id="sectionImage" name="sectionImage" 
                        @change="uploadImage"
                         >
                        </div>
                        <div class="text-center">
                        <button type="submit" class="submit-button"
                        style="border-radius: 21px; padding: 10px; margin: 5px; background-color: #4CAF50; color: white; border: none; cursor: pointer;">Edit</button>
                        <button type="button" class="cancel-button" @click="closeeditSectionForm"
                        style="border-radius: 21px; padding: 10px; margin: 5px; background-color: #f44336; color: white; border: none; cursor: pointer;">Cancel</button>
                        </div>
                    </form>
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
      section_name: "",
      dateCreated: "",
      description: "",
      sectionImage: "",
      section_id: "",
      showSectionForm: false,
      showeditSectionForm: false,
      sectionData: [],
      noSection: false,
    };
  },
  mounted() {
    this.getSection();
  },
  methods: {
    formatDate(dateString) {
      const options = { year: "numeric", month: "long", day: "numeric" };
      const formattedDate = new Date(dateString).toLocaleDateString(
        undefined,
        options
      );
      return formattedDate;
    },
    uploadImage(event) {
      const reader = new FileReader();
      reader.onload = () => {
        this.sectionImage = reader.result;
      };
      reader.readAsDataURL(event.target.files[0]);
    },
    addSection() {
      this.showSectionForm = !this.showSectionForm;
    },
    SubmitSection() {
      const formdata = {
        name: this.section_name,
        dateCreated: this.dateCreated,
        description: this.description,
        image: this.sectionImage,
      };
      console.log(formdata);
      fetch("/api/section", {
        method: "POST",
        body: JSON.stringify(formdata),
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
        .then((res) => {
          if (res.status == 401) {
            alert("Unauthorized Access");
          }
          if (res.status == 400) {
            alert("Bad Request");
          }
          if (res.status == 500) {
            alert("Internal Server Error");
          }
          return res.json();
        })
        .then((data) => {
          if (data.error) {
            alert(data.error);
          } else {
            alert(data.message);
            this.getSection();
            this.showSectionForm = false;
          }
        });
    },
    getSection() {
      fetch("/api/section", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
        .then((res) => {
          if (res.status == 401) {
            alert("Unauthorized Access");
          }
          if (res.status == 400) {
            alert("Bad Request");
          }
          if (res.status == 500) {
            alert("Internal Server Error");
          }
          return res.json();
        })
        .then((data) => {
          if (data.error) {
            alert(data.error);
          } else {
            this.sectionData = data;
            console.log(this.sectionData);
            if (this.sectionData.length == 0) {
              noSection = true;
            }
          }
        });
    },
    editSection(section) {
      this.showeditSectionForm = true;
      this.section_name = section.name;
      this.dateCreated = section.dateCreated;
      this.description = section.description;
      this.sectionImage = section.image;
      this.section_id = section.id;
    },
    closeeditSectionForm() {
      this.showeditSectionForm = false;
    },
    submiteditSection() {
      const formdata = {
        name: this.section_name,
        dateCreated: this.dateCreated,
        description: this.description,
        image: this.sectionImage,
      };
      console.log(formdata);
      fetch(`/api/section/${this.section_id}`, {
        method: "PUT",
        body: JSON.stringify(formdata),
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            alert(data.error);
          } else {
            alert(data.message);
            this.getSection();
            this.showeditSectionForm = false;
            this.section_name = "";
            this.dateCreated = "";
            this.description = "";
            this.sectionImage = "";
            this.section_id = "";
          }
        });
    },
    deleteSection(id) {
      if (!confirm("Are you sure you want to delete this section?")) {
        return;
      }
      fetch(`/api/section/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            alert(data.error);
          } else {
            alert(data.message);
            this.getSection();
          }
        });
    },
  },
});

export default librariandasboard;
