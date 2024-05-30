import navbar from "./navbar.js";
import footerr from "./footers.js";

const home = Vue.component("home", {
  template: `
    <div>
      <navbar></navbar>
      <div class="container" style=  "text-align: center; margin-top: 50px;">
        <input
          type="text"
          v-model="searchTerm"
          @input="filterBooks"
          placeholder="Search by book name, section, or author"
          style="width: 100%; padding: 10px; margin: 10px 0; box-sizing: border-box; font-size: 16px; border-radius: 25px; border: 1px solid #ccc;"
        />
        <div class="section-container">
          <div class="section" v-for="book in filteredBooks" :key="book.id">
            <img :src="book.image" alt="section image" class="section-image">
            <h3>{{book.name}}</h3>
            <p>{{formatDate(book.datePublished)}}</p>
            <p>{{formatDate(book.returnDate)}}</p>
            <div class="request-return-buttons">
            <button class="submit-button" @click="requestBook(book)"
            style="border-radius: 21px; padding: 10px; margin: 5px; background-color: #4CAF50; color: white; border: none; cursor: pointer;"
            v-if="book.requestStatus === 'none' || book.requestStatus === 'returned' || book.requestStatus === 'revoked' || book.requestStatus === 'rejected'">
        Request
    </button>
    
              <button class="warn-button" v-else-if="book.requestStatus=='approved'" @click="showpdf(book)"
              style="border-radius: 21px; padding: 10px; margin: 5px; background-color: #f44336; color: white; border: none; cursor: pointer;">View Book</button>
              <button class="cancel-button" v-else
              style="border-radius: 21px; padding: 10px; margin: 5px; background-color:#D0EF09 ; color: white; border: none; cursor: pointer;">Requested</button>
             
            </div>
          </div>
        </div>

        <div class="model" v-if="showRequestForm">
          <div class="paper1-form-container">
            <h2 class="form-title">Book Request</h2>
            <p class="form-description">Please enter the return date for the book</p>
            <form @submit.prevent="submitrequestBook">
              <div class="form-group">
                <label for="name">Return Date</label>
                <input type="datetime-local" class="form-control" id="name" v-model="returnDate" required>
              </div>
              <div style="margin-top:10px;">
                <button type="submit" class="submit-button"
                style="border-radius: 21px; padding: 10px; margin: 5px; background-color: #4CAF50; color: white; border: none; cursor: pointer;">Request</button>
               
                <button class="cancel-button" @click="showRequestForm=false"
                style="border-radius: 21px; padding: 10px; margin: 5px; background-color: #f44336; color: white; border: none; cursor: pointer;">Cancel</button>
                
              </div>
            </form>
          </div>
        </div>
      </div>
      <div class="modeling" v-if="showPdf">
                <div class="pdf-container">
                <iframe :src="bookcontent" width="200%" height="600px" frameborder="0"></iframe>
                    <button @click="showPdf = false" class="cancel-button">Close</button>
                </div>
                <div class="rating">
                <h2 class="form-card-title">Ratings</h2>
                <h6 class="form-title
                " v-if="ratingdata.length==0">No Ratings</h6>
                <div class="rating-container" v-else>
                    <div v-for="rate in ratingdata">
                    <h6 class="form-title
                    ">{{rate.comment}}</h6>
                    <h6 class="form-title
                    ">{{rate.rating}}</h6>
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
      books: [],
      searchTerm: "",
      showRequestForm: false,
      returnDate: "",
      bookId: "",
      showPdf: false,
      ratingdata:[],
    };
  },
  computed: {
    filteredBooks() {
      const searchTerm = this.searchTerm.toLowerCase();
      return this.books.filter(
        (book) =>
          book.name.toLowerCase().includes(searchTerm) ||
          book.section.toLowerCase().includes(searchTerm) ||
          book.author.toLowerCase().includes(searchTerm)
      );
    },
  },
  mounted() {
    if (!localStorage.getItem("token")) {
      this.$router.push("/login");
    } else {
      this.getBooks();
    }
  },
  methods: {
    getrate(book) {
      fetch("/bookratings/" + book.id, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
        .then((response) => response.json())
        .then((data) => {
          this.ratingdata = data;
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
    showpdf(book) {
      this.showPdf = true;
      this.bookcontent = book.content;
      this.getrate(book);
    },
    requestBook(book) {
      this.showRequestForm = true;
      this.bookId = book.id;
    },
    submitrequestBook() {
      fetch("/bookrequest/" + this.bookId, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({
          dateReturn: this.returnDate,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          this.showRequestForm = false;
          alert(data.message);
          this.getBooks();
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
    formatDate(dateString) {
      const options = { year: "numeric", month: "long", day: "numeric" };
      const formattedDate = new Date(dateString).toLocaleDateString(
        undefined,
        options
      );
      return formattedDate;
    },
    getBooks() {
      fetch("/userbooks", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          this.books = data;
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
  },
});

export default home;
