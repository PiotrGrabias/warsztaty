<template>
  <v-container>
    <v-col cols="auto" class="mx-2">
      <h1 class="display-1 text-center">Dostępne <kbd></kbd>książki</h1>
      <h1 class="display-1 text-center"><v-btn color="teal" @click="viewAdd">Dodaj książkę</v-btn></h1>
    </v-col>
    <v-row>
      <v-col v-for="book in books" :key="book.id" cols="12" md="2">
        <v-card elevation="4" hover>
          <v-card-title>{{ book.title }}</v-card-title>
          <v-card-actions>
            <v-btn color="secondary" elevated @click="viewDetails(book.id)">Szczegóły</v-btn>
            <v-btn @click="confirmDelete(book)">
              <v-icon size="x-large">mdi-delete</v-icon>
            </v-btn>
            <v-btn @click="viewEdit(book.id)">
              <v-icon size="x-large">mdi-pencil</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-dialog v-model="add" max-width="500">
      <v-card>
        <v-text-field clearable class="headline" v-model="newTitle" label="Tytuł"></v-text-field>
        <v-text-field class="headline" v-model="newAuthor" label="Autor"></v-text-field>
        <v-text-field class="headline" v-model="newIsbn" label="Isbn"></v-text-field>
        <v-card-actions>
          <v-btn @click="addBook()">Dodaj książkę</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="add = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="edit" max-width="500">
      <v-card>
        <v-text-field clearable class="headline" v-model="title" label="Tytuł"></v-text-field>
        <v-text-field class="headline" v-model="author" label="Autor"></v-text-field>
        <v-text-field class="headline" v-model="isbn" label="Isbn"></v-text-field>
        <v-card-actions>
          <v-btn @click="editBook()">Edytuj książkę</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="edit = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title class="headline">{{ selectedBook.title }}</v-card-title>
        <v-card-text>
          <p><strong>Autor:</strong> {{ selectedBook.author }}</p>
          <p><strong>ISBN:</strong> {{ selectedBook.isbn }}</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="dialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="deleteDialog" max-width="500">
      <v-card>
        <v-card-title class="headline">Potwierdzenie usunięcia</v-card-title>
        <v-card-text>
          Czy na pewno chcesz usunąć książkę "{{ selectedBook.title }}"?
        </v-card-text>
        <v-card-actions>
          <v-btn color="red" @click="deleteBook(selectedBook.id)">Usuń</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="deleteDialog = false">Anuluj</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-progress-circular v-if="loading" indeterminate color="primary" size="64"></v-progress-circular>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const loading = ref(false);
const books = ref([]);
const dialog = ref(false);
const selectedBook = ref({});
const edit = ref(false);
const title = ref('');
const author = ref('');
const isbn = ref('');
const add = ref(false);
const newIsbn = ref('')
const newAuthor = ref('')
const newTitle = ref('')
const deleteDialog = ref(false);

async function getBooks() {
  loading.value = true;
  try {
    const response = await fetch('http://localhost:8080/books');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    books.value = await response.json();
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}
async function deleteBook(bookId) {
  try {
    const response = await fetch(`http://localhost:8080/books/${bookId}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    books.value = books.value.filter(book => book.id !== bookId);
  } catch (err) {
    console.error(err);
  } finally {
    deleteDialog.value = false;
  }
}
async function editBook() {
  const updatedBook = {
    title: title.value,
    author: author.value,
    isbn: isbn.value
  };

  try {
    const response = await fetch(`http://localhost:8080/books/${selectedBook.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedBook)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const updatedBooks = await response.json();
    const index = books.value.findIndex(book => book.id === selectedBook.value.id);
    if (index !== -1) {
      books.value[index] = updatedBooks;
    }
    edit.value = false;
  } catch (err) {
    console.error(err);
  }
}
async function addBook() {
  const newBook = {
    title: newTitle.value,
    author: newAuthor.value,
    isbn: newIsbn.value
  };
 
  try {
    const response = await fetch('http://localhost:8080/books', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newBook)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const addedBook = await response.json();
    books.value.push(addedBook);
    add.value = false;
  } catch (err) {
    console.error(err);
  }
}

function viewDetails(bookId) {
  const book = books.value.find(b => b.id === bookId);
  selectedBook.value = book;
  dialog.value = true;
}

function viewEdit(bookId) {
  const book = books.value.find(b => b.id === bookId);
  selectedBook.value = book;
  title.value = book.title;
  author.value = book.author;
  isbn.value = book.isbn;
  edit.value = true;
}
function viewAdd() {
  newTitle.value = '';
  newAuthor.value = '';
  newIsbn.value = '';
  add.value = true;
}
function confirmDelete(book) {
  selectedBook.value = book;
  deleteDialog.value = true;
}

onMounted(() => {
  getBooks();
});
</script>

<style scoped>
.v-card-title {
  font-size: 1.25rem;
  font-weight: bold;
}
.v-card-subtitle {
  font-size: 1rem;
  color: grey;
}
.v-card-text {
  font-size: 0.9rem;
}
.v-progress-circular {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
