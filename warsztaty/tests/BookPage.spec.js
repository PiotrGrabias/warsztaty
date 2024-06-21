// tests/BookComponent.test.js
import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import BookPage from '../src/components/BookPage.vue'; // Adjust the path to your component
import { nextTick } from 'vue';

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]), // Return an empty array initially
  })
);

describe('BookPage', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(BookPage);
  });

  it('renders properly', () => {
    expect(wrapper.exists()).toBe(true);
  })

  it('fetches books on mount', async () => {
    await nextTick();
    expect(fetch).toHaveBeenCalledWith('http://localhost:8080/books');
  });

  it('opens add book dialog', async () => {
    const addButton = wrapper.find('button:contains(Dodaj książkę)');
    await addButton.trigger('click');
    expect(wrapper.vm.add).toBe(true);
  });

  it('adds a book', async () => {
    wrapper.vm.newTitle = 'New Book';
    wrapper.vm.newAuthor = 'New Author';
    wrapper.vm.newIsbn = '1234567890';

    // Mock fetch response for adding book
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        id: 1,
        title: 'New Book',
        author: 'New Author',
        isbn: '1234567890'
      }),
    });

    await wrapper.vm.addBook();
    await nextTick();

    expect(wrapper.vm.books).toHaveLength(1);
    expect(wrapper.vm.books[0].title).toBe('New Book');
  });

  it('opens edit book dialog', async () => {
    wrapper.vm.books = [{
      id: 1,
      title: 'Sample Book',
      author: 'Sample Author',
      isbn: '1234567890'
    }];
    await nextTick();

    const editButton = wrapper.find('button[aria-label="edit"]');
    await editButton.trigger('click');
    expect(wrapper.vm.edit).toBe(true);
    expect(wrapper.vm.title).toBe('Sample Book');
  });

  it('edits a book', async () => {
    wrapper.vm.books = [{
      id: 1,
      title: 'Sample Book',
      author: 'Sample Author',
      isbn: '1234567890'
    }];
    await nextTick();

    wrapper.vm.selectedBook = wrapper.vm.books[0];
    wrapper.vm.title = 'Edited Book';
    wrapper.vm.author = 'Edited Author';
    wrapper.vm.isbn = '0987654321';

    // Mock fetch response for editing book
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        id: 1,
        title: 'Edited Book',
        author: 'Edited Author',
        isbn: '0987654321'
      }),
    });

    await wrapper.vm.editBook();
    await nextTick();

    expect(wrapper.vm.books[0].title).toBe('Edited Book');
  });

  it('deletes a book', async () => {
    wrapper.vm.books = [{
      id: 1,
      title: 'Sample Book',
      author: 'Sample Author',
      isbn: '1234567890'
    }];
    await nextTick();

    wrapper.vm.selectedBook = wrapper.vm.books[0];
    wrapper.vm.deleteDialog = true;

    // Mock fetch response for deleting book
    fetch.mockResolvedValueOnce({
      ok: true,
    });

    await wrapper.vm.deleteBook(1);
    await nextTick();

    expect(wrapper.vm.books).toHaveLength(0);
  });

  it('opens book details dialog', async () => {
    wrapper.vm.books = [{
      id: 1,
      title: 'Sample Book',
      author: 'Sample Author',
      isbn: '1234567890'
    }];
    await nextTick();

    const detailButton = wrapper.find('details');
    await detailButton.trigger('click');

    expect(wrapper.vm.dialog).toBe(true);
    expect(wrapper.vm.selectedBook.title).toBe('Sample Book');
  });
});
