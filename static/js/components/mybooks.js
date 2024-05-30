import navbar from "./navbar.js";
import footerr from "./footers.js";

const mybooks = Vue.component("mybooks", {
  template: `
    <div>
    <navbar></navbar>
        <div class="container">
            <h2 class="form-title">My Books</h2>
            <h6 class="form-title" v-if="books.length==0">No Books</h6>
            <table class="table table-striped" v-else>
            <thead>
              <tr>
                <th scope="col">Book Name</th>
                <th scope="col">Author</th>
                <th scope="col">Section</th>
                <th scope="col">Return Date</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="book in books">
                <td v-if="book.status=='pending'">{{book.name}}</td>
                <td v-if="book.status=='approved'" 
                style="color:blue; text-decoration:underline; cursor:poiner;"
                @click="showpdf(book)"
                >{{book.name}}
                </td>
                <td>{{book.author}}</td>
                <td>{{book.section}}</td>
                <td>{{formatDate(book.dateReturn)}}</td>
                <td>
                <button class="cancel-button" @click="returnBook(book)" v-if="book.status=='approved'"
                style="border-radius: 21px; padding: 10px; margin: 5px; background-color: #f44336; color: white; border: none; cursor: pointer;">Return</button>
                <button class="cancel-button" @click="returnBook(book)" v-if="book.status=='pending'" enabled
                style="border-radius: 21px; padding: 10px; margin: 5px; background-color: #f44336; color: white; border: none; cursor: pointer;">Cancel</button>
                </td>
              </tr>
            </tbody>
            </table>


            <h2 class="form-title">Completed Books</h2>
            <h6 class="form-title" v-if="retunredBooks.length==0">No Books</h6>
            <table class="table table-striped" v-else>
            <thead>
              <tr>
                <th scope="col">Book Name</th>
                <th scope="col">Author</th>
                <th scope="col">Section</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="book in retunredBooks">
                <td>{{book.name}}</td>
                <td>{{book.author}}</td>
                <td>{{book.section}}</td>
                <td>
                <button class="warn-button" @click="showdetails(book)"
                style="border-radius: 21px; padding: 10px; margin: 5px; background-color: #4CAF50; color: white; border: none; cursor: pointer;">view</button>
                <button class="warn-button" @click="rate(book)"
                style="border-radius: 21px; padding: 10px; margin: 5px; background-color: #4CAF50; color: white; border: none; cursor: pointer;">Rate</button>
                </td>
              </tr>
            </tbody>
            </table>

            <div class="model" v-if="showdetailsForm">
            <div  class="paper1-form-container">
                <div style="display:flex; justify-content:space-between;">
                <h2 class="form-title">Details</h2>
                <button class="cancel-button" @click="showdetailsForm = false">X</button>
                </div>
                <h6 class="form-title">Author: {{selectedBook.author}}</h6>
                <h6 class="form-title">Section: {{selectedBook.section}}</h6>
                <h6 class="form-title">Returned Date: {{formatDate(selectedBook.dateReturn)}}</h6>
                <h6 class="form-title">Status: {{selectedBook.status}}</h6>
            </div>
            </div>
          
            <div class="modeling" v-if="showPdf">
                <div class="pdf-container">
                <iframe :src="bookcontent" width="200%" height="600px" frameborder="0"></iframe>
                    <button @click="showPdf = false" class="cancel-button"
                    style="border-radius: 21px; padding: 10px; margin: 5px; background-color: #f44336; color: white; border: none; cursor: pointer;">Close</button>
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
        <div class="modeling" v-if="showRate">
                <div class="paper-form-container">
                <form @submit.prevent="rateBook">
                    <h2 class="form-title">Rate</h2>
                    <label>Rate</label>
                    <input type="number" class="form-control" v-model="rating" value=1 placeholder="Rate" min=1 max=5 required>
                    <label style="margin-top:10px;">Comment</label>
                    <textarea class="form-control" v-model="comment" placeholder="Comment" required></textarea>
                    <div style="margin-top:10px;">
                    <button class="warn-button"
                    style="border-radius: 21px; padding: 10px; margin: 5px; background-color: #4CAF50; color: white; border: none; cursor: pointer;">Rate</button>
                    <button class="cancel-button" @click="showRate = false"
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
      books: [],
      retunredBooks: [],
      showPdf: false,
      bookcontent: "",
      showdetailsForm: false,
      selectedBook: {},
      showRate: false,
      rating: 0,
      comment: "",
      ratingdata: []
    };
  },
  mounted() {
    if (!localStorage.getItem("token")) {
      this.$router.push("/login");
    } else {
      this.getBooks();
    }
  },
  methods: {
    showdetails(book) {
      this.showdetailsForm = true;
      this.selectedBook = book;
    },
    showpdf(book) {
      this.showPdf = true;
      this.bookcontent = book.content;
      this.getrate(book);
    },
    formatDate(dateString) {
      const options = { year: "numeric", month: "long", day: "numeric" };
      
      // Create a new Date object
      let date = new Date(dateString);
      
      // Subtract a day
      date.setDate(date.getDate() - 1);
      
      const formattedDate = date.toLocaleDateString(undefined, options);
      return formattedDate;
    },
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
    getBooks() {
      fetch("/mybooks", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Received data:", data); // Debugging: Log received data
    
          // Ensure data is an array and not empty
          if (Array.isArray(data) && data.length > 0) {
            // Filter books based on status
            this.books = data.filter(
              (book) => book.status === "approved" || book.status === "pending"
            );
            this.retunredBooks = data.filter((book) => book.status === "returned");
    
            console.log("Filtered books:", this.books); // Debugging: Log filtered books
          } else {
            console.warn("Empty or invalid data received:", data);
          }
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    },
    returnBook(book) {
      if (!confirm("Are you sure you want to return this book?")) {
        return;
      }
      fetch("/returnbook/" + book.rid, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message) {
            alert(data.message);
            this.getBooks();
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
    rate(book) {
      console.log(book);
      this.showRate = true;
      this.selectedBook = book;
    },
    rateBook() {
      if (this.rating < 1 || this.rating > 5) {
        alert("Rate must be between 1 and 5");
        return;
      }
      fetch("/ratebook/" + this.selectedBook.id, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({
          rating: this.rating,
          comment: this.comment,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message) {
            alert(data.message);
            this.getBooks();
            this.showRate = false;
            this.rating = 0;
            this.comment = "";
            this.selectedBook = {};
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          this.showRate = false;
          this.rating = 0;
          this.comment = "";
          this.selectedBook = {};
        });
    },
  },
});
export default mybooks;
