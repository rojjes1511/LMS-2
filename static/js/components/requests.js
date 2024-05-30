import navbar from "./navbar.js";
import footerr from "./footers.js";

const requests = Vue.component("requests", {
  template: `
    <div>
    <navbar></navbar>
        <div class="container">
            <h2 class="form-title">Book Requests</h2>
            <h6 class="form-title" v-if="norequests">No Pending Requests</h6>
          <table class="table table-striped" v-else>
            <thead>
              <tr>
                <th scope="col">Book Name</th>
                <th scope="col">Author</th>
                <th scope="col">Section</th>
                <th scope="col">Return Date</th>
                <th scope="col">Status</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="book in books">
                <td v-if="book.status=='pending'" @click="showreqdetails(book)">{{book.name}}</td>
                <td>{{book.author}}</td>
                <td>{{book.section}}</td>
                <td>{{formatDate(book.dateReturn)}}</td>
                <td>{{book.status}}</td>
                <td>
                <button type="submit" class="submit-button" @click="submitApproval(book.rid)"
                style="border-radius: 21px; padding: 10px; background-color: #4CAF50; color: white; border: none; cursor: pointer;"
                >Grant</button>
                <button type="button" class="cancel-button" @click="reject(book.rid)"
                style="margin-left: 10px; background-color: #f44336; color: white; border: none; cursor: pointer; border-radius: 21px; padding: 10px;"
                >Reject</button>
                </td>
              </tr>
            </tbody>
            </table>

            <h2 class="form-title">Approved Books</h2>
            <h6 class="form-title" v-if="noapproved">No Approved Books</h6>
          <table class="table table-striped" v-else>
            <thead>
              <tr>
                <th scope="col">Book Name</th>
                <th scope="col">Author</th>
                <th scope="col">Section</th>
                <th scope="col">Return Date</th>
                <th scope="col">User</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="book in approvedBooks">
                <td v-if="book.status=='approved'" @click="showreqdetails(book)">{{book.name}}</td>
                <td>{{book.author}}</td>
                <td>{{book.section}}</td>
                <td>{{formatDate(book.dateReturn)}}</td>
                <td>{{book.username}}</td>
                <td>
                <button type="button" class="warn-button" @click="revoke(book)"
                style="margin-left: 10px; background-color: #f44336; color: white; border: none; cursor: pointer; border-radius: 21px; padding: 10px;"
                >Revoke</button>
                </td>
              </tr>
            </tbody>
            </table>

          
            <div class="model" v-if="showdetailsForm">
                <div  class="paper1-form-container">
                    <div style="display:flex; justify-content:space-between;">
                    <h2 class="form-title">Request Details</h2>
                    <button class="cancel-button" @click="showdetailsForm = false">X</button>
                    </div>
                    <h6 class="form-title">{{selectedBook.username}}</h6>
                    <h6 class="form-title">{{selectedBook.name}}</h6>
                    <h6 class="form-title">{{selectedBook.author}}</h6>
                    <h6 class="form-title">{{selectedBook.section}}</h6>
                    <h6 class="form-title">{{formatDate(selectedBook.dateReturn)}}</h6>

                    <form @submit.prevent="submitApproval(selectedBook.rid)" class="login-form">
                        <div class="text-center">
                        <button type="submit" class="submit-button">Grant</button>
                        <button type="button" class="cancel-button" @click="reject(selectedBook.rid)"
                        style="margin-left: 10px; background-color: #f44336; color: white; border: none; cursor: pointer; border-radius: 21px; padding: 10px;"
                        >Reject</button>
                        <button type="button" class="warn-button" @click="showpdf(selectedBook)"
                        style="margin-left: 10px; background-color: #ff9800; color: white; border: none; cursor: pointer; border-radius: 21px; padding: 10px;">ViewBook</button>
                        </div>
                    </form>
                </div>
            </div>

            
            <div class="modeling" v-if="showPdf">
                <div class="pdf-container">
                <iframe :src="bookcontent" width="200%" height="600px" frameborder="0"></iframe>
                    <button @click="showPdf = false" class="cancel-button"
                    style="border-radius: 21px; padding: 10px; margin: 5px; background-color: #f44336; color: white; border: none; cursor: pointer;">Close</button>
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
      approvedBooks: [],
      showdetailsForm: false,
      selectedBook: {},
      showPdf: false,
      norequests: false,
      noapproved: false,
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
    showreqdetails(book) {
      this.showdetailsForm = true;
      this.selectedBook = book;
    },
    showpdf(book) {
      this.showPdf = true;
      this.bookcontent = book.content;
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
      fetch("/bookrequests", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
        .then((response) => response.json())
        .then((data) => {
          this.books = data.filter((book) => book.status === "pending");
          this.approvedBooks = data.filter(
            (book) => book.status === "approved"
          );
          if (this.books.length === 0) {
            this.norequests = true;
          } else {
            this.norequests = false;
          }
          if (this.approvedBooks.length === 0) {
            this.noapproved = true;
          } else {
            this.noapproved = false;
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
    submitApproval(id) {
      if (!confirm("Are you sure you want to approve this request?")) return;
      fetch("/bookrequests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({ status: "approved", bookrequest_id: id }),
      })
        .then((response) => response.json())
        .then((data) => {
          this.showdetailsForm = false;
          alert(data.message);
          this.getBooks();
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
    reject(id) {
      if (!confirm("Are you sure you want to reject this request?")) return;
      fetch("/bookrequests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({ status: "rejected", bookrequest_id: id }),
      })
        .then((response) => response.json())
        .then((data) => {
          alert(data.message);
          this.getBooks();
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
    revoke(book) {
      if (!confirm("Are you sure you want to revoke this book?")) return;
      fetch("/bookrequests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({ status: "revoked", bookrequest_id: book.rid }),
      })
        .then((response) => response.json())
        .then((data) => {
          alert(data.message);
          this.getBooks();
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
  },
});
export default requests;
