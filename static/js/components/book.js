import navbar from "./navbar.js";
import footerr from "./footers.js";

const book = Vue.component("book", {
  template: `
  <div>
  <navbar></navbar>
  <div class="container">
    <h1>Book</h1>
    <div v-if="nobook">
      <p>No Books Available!!</p>
    </div>
    <div class="section-container" v-else>
      <div class="section" v-for="book in bookData" :key="book.id">
        <img :src="book.image" alt="Book image" class="section-image" @click="viewPdf(book.content)">
        <h3>{{book.name}}</h3>
        <p>{{formatDate(book.datePublished)}}</p>
        <p>{{formatDate(book.returnDate)}}</p>
        <div class="edit-delete-buttons">
          <button class="submit-button" @click="editBook(book)"
          style="border-radius: 21px; padding: 10px; margin: 5px; background-color: #f44336; color: white; border: none; cursor: pointer;">Edit</button>
          <button class="cancel-button" @click="deleteBook(book.id)"
          style="border-radius: 21px; padding: 10px; margin: 5px; background-color: #E60606 ; color: white; border: none; cursor: pointer;" >Delete</button>
          
        </div>
      </div>
    </div>
    <button @click="addbook" class="submit-button"
    style="border-radius: 21px; padding: 10px; margin: 5px; background-color: #4CAF50; color: white; border: none; cursor: pointer;">Add book</button>
    <button @click="$router.go(-1)" class="cancel-button"
    style="border-radius: 21px; padding: 10px; margin: 5px; background-color: #f44336; color: white; border: none; cursor: pointer;">Back</button>
  </div>

  <div class="model" v-if="showbookForm">
    <div class="paper1-form-container">
      <h2 class="form-title">Add Book</h2>
      <form @submit.prevent="SubmitBook" class="login-form">
        <div class="mb-3">
          <label for="Book_name" class="form-label">Book Name</label>
          <input type="text" class="form-control" id="Book_name" name="Book_name" v-model="Book_name" required>
        </div>
        <div class="mb-3">
          <label for="author" class="form-label">Author</label>
          <input type="text" class="form-control" id="author" name="author" v-model="author" required>
        </div>
        <div class="mb-3">
          <label for="content" class="form-label">Content</label>
          <input type="file" class="form-control" id="content" name="content" @change="uploadpdf" required>
        </div>
        <div class="mb-3">
          <label for="datePublished" class="form-label">Date Published</label>
          <input type="date" class="form-control" id="datePublished" name="datePublished" v-model="datePublished" required>
        </div>
        <div class="mb-3">
          <label for="returndate" class="form-label">Return Date</label>
          <input type="date" class="form-control" id="returndate" name="returndate" v-model="returndate" required>
        </div>
        <div class="mb-3">
          <label for="BookImage" class="form-label">Book Image</label>
          <input type="file" class="form-control" id="BookImage" name="BookImage" @change="uploadImage">
        </div>
        <div class="text-center">
          <button type="submit" class="submit-button"
          style="border-radius: 21px; padding: 10px; margin: 5px; background-color: #4CAF50; color: white; border: none; cursor: pointer;">Add</button>
          <button type="button" class="cancel-button" @click="addbook"
          style="border-radius: 21px; padding: 10px; margin: 5px; background-color: #f44336; color: white; border: none; cursor: pointer;">Cancel</button>
        </div>
      </form>
    </div>
  </div>

  <div class="model" v-if="showeditForm">
    <div class="paper1-form-container">
      <h2 class="form-title">Edit Book</h2>
      <form @submit.prevent="SubmiteditBook" class="login-form">
        <div class="mb-3">
          <label for="Book_name" class="form-label">Book Name</label>
          <input type="text" class="form-control" id="Book_name" name="Book_name" v-model="Book_name" required>
        </div>
        <div class="mb-3">
          <label for="author" class="form-label">Author</label>
          <input type="text" class="form-control" id="author" name="author" v-model="author" required>
        </div>
        <div class="mb-3">
          <label for="content" class="form-label">Content</label>
          <input type="file" class="form-control" id="content" name="content" @change="uploadpdf">
        </div>
        <div class="mb-3">
          <label for="datePublished" class="form-label">Date Published</label>
          <input type="date" class="form-control" id="datePublished" name="datePublished" v-model="datePublished" required>
        </div>
        <div class="mb-3">
          <label for="returndate" class="form-label">Return Date</label>
          <input type="date" class="form-control" id="returndate" name="returndate" v-model="returndate" required>
        </div>
        <div class="mb-3">
          <label for="BookImage" class="form-label">Book Image</label>
          <input type="file" class="form-control" id="BookImage" name="BookImage" @change="uploadImage">
        </div>
        <div class="text-center">
          <button type="submit" class="submit-button"
          style="border-radius: 21px; padding: 10px; margin: 5px; background-color: #4CAF50; color: white; border: none; cursor: pointer;">Edit</button>
          <button type="button" class="cancel-button" @click="showeditForm = false"
          style="border-radius: 21px; padding: 10px; margin: 5px; background-color: #f44336; color: white; border: none; cursor: pointer;">Cancel</button>
        </div>
      </form>
    </div>
  </div>

  <div class="modeling" v-if="showPdf">
    <div class="pdf-container">
      <iframe :src="bookcontent" width="200%" height="600px" frameborder="0"></iframe>
      <button @click="showPdf = false" class="cancel-button"
      style="border-radius: 21px; padding: 10px; margin: 5px; background-color: #f44336; color: white; border: none; cursor: pointer;"
      >Close</button>
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
      nobook: false,
      sectionid: this.$route.params.sectionid,
      bookData: [],
      author: "",
      showbookForm: false,
      bookid: "",
      Book_name: "",
      book_image: "",
      content: "",
      datePublished: "",
      returndate: "",
      bookcontent: "",
      showPdf: false,
      showeditForm: false,
    };
  },
  mounted() {
    fetch(`/api/book/section/${this.sectionid}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("No book found");
        }
      })
      .then((data) => {
        this.bookData = data;
        if (this.bookData.length === 0) {
          this.nobook = true;
        } else {
          this.nobook = false;
        }
      })
      .catch((error) => {
        console.error("Error:", error.message);
      });
  },
  methods: {
    viewPdf(content) {
      this.bookcontent = content;
      this.showPdf = true;
    },
    SubmiteditBook() {
      const bookData = {
        title: this.Book_name,
        author: this.author,
        content: this.content,
        datePublished: this.datePublished,
        returnDate: this.returndate,
        image: this.book_image,
      };
      fetch(`/api/book/${this.bookid}`, {
        method: "PUT",
        body: JSON.stringify(bookData),
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Book not added");
          }
        })
        .then((data) => {
          alert(data.message);
          this.showeditForm = false;
          this.Book_name = "";
          this.author = "";
          this.content = "";
          this.datePublished = "";
          this.returndate = "";
          this.book_image = "";
          this.$router.go();
        })
        .catch((error) => {
          alert(error.message);
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
    editBook(book) {
      this.bookid = book.id;
      this.showeditForm = true;
      this.Book_name = book.name;
      this.author = book.author;
      this.content = book.content;
      this.datePublished = book.datePublished;
      this.returndate = book.returnDate;
      this.book_image = book.image;
    },
    uploadpdf(event) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.content = e.target.result;
      };
      reader.readAsDataURL(event.target.files[0]);
    },
    uploadImage(event) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.book_image = e.target.result;
      };
      reader.readAsDataURL(event.target.files[0]);
    },
    addbook() {
      this.showbookForm = !this.showbookForm;
    },
    SubmitBook() {
      const bookData = {
        title: this.Book_name,
        author: this.author,
        content: this.content,
        datePublished: this.datePublished,
        returnDate: this.returndate,
        image: this.book_image,
      };
      fetch(`/api/book/section/${this.sectionid}`, {
        method: "POST",
        body: JSON.stringify(bookData),
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Book not added");
          }
        })
        .then((data) => {
          alert(data.message);
          this.showbookForm = false;
          this.Book_name = "";
          this.author = "";
          this.content = "";
          this.datePublished = "";
          this.returndate = "";
          this.book_image = "";
          this.$router.go();
        })
        .catch((error) => {
          console.error("Error:", error.message);
        });
    },
    deleteBook(bookid) {
      if (!confirm("Are you sure you want to delete this book?")) {
        return;
      }
      fetch(`/api/book/${bookid}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Book not deleted");
          }
        })
        .then((data) => {
          this.$router.go();
          alert(data.message);
        })
        .catch((error) => {
          console.error("Error:", error.message);
        });
    },
  },
});

export default book;
