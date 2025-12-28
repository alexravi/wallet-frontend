import React, { useState, useEffect } from 'react';
import { categoryService, CreateCategoryData } from '../services/categoryService';
import { Category } from '../types/account.types';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showArchived, setShowArchived] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CreateCategoryData>({
    name: '',
    icon: '',
    color: '',
    keywords: [],
  });

  useEffect(() => {
    loadCategories();
  }, [showArchived]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getCategories(showArchived);
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory._id, formData);
      } else {
        await categoryService.createCategory(formData);
      }
      setShowForm(false);
      setEditingCategory(null);
      setFormData({ name: '', icon: '', color: '', keywords: [] });
      loadCategories();
    } catch (err: any) {
      setError(err.message || 'Failed to save category');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon || '',
      color: category.color || '',
      keywords: category.keywords || [],
    });
    setShowForm(true);
  };

  const handleArchive = async (id: string) => {
    if (window.confirm('Are you sure you want to archive this category?')) {
      try {
        await categoryService.archiveCategory(id);
        loadCategories();
      } catch (err: any) {
        setError(err.message || 'Failed to archive category');
      }
    }
  };


  const systemCategories = categories.filter((c) => c.type === 'system' && !c.isArchived);
  const customCategories = categories.filter((c) => c.type === 'custom' && !c.isArchived);
  const archivedCategories = categories.filter((c) => c.isArchived);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Categories</h1>
        <div style={styles.actions}>
          <button onClick={() => setShowArchived(!showArchived)} style={styles.button}>
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </button>
          <button onClick={() => { setShowForm(true); setEditingCategory(null); setFormData({ name: '', icon: '', color: '', keywords: [] }); }} style={styles.buttonPrimary}>
            + Add Category
          </button>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {showForm && (
        <div style={styles.formContainer}>
          <h2>{editingCategory ? 'Edit Category' : 'Create Category'}</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label>Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={editingCategory?.type === 'system'}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label>Icon</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="🍽️"
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label>Color</label>
              <input
                type="color"
                value={formData.color || '#000000'}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                style={styles.input}
              />
            </div>
            <div style={styles.formActions}>
              <button type="submit" style={styles.buttonPrimary}>Save</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingCategory(null); }} style={styles.button}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          {systemCategories.length > 0 && (
            <div style={styles.section}>
              <h2>System Categories</h2>
              <div style={styles.grid}>
                {systemCategories.map((cat) => (
                  <div key={cat._id} style={styles.card}>
                    <div style={{ ...styles.cardHeader, backgroundColor: cat.color || '#ccc' }}>
                      <span style={styles.icon}>{cat.icon || '📦'}</span>
                      <span style={styles.cardTitle}>{cat.name}</span>
                    </div>
                    <div style={styles.cardActions}>
                      <button onClick={() => handleEdit(cat)} style={styles.smallButton}>Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {customCategories.length > 0 && (
            <div style={styles.section}>
              <h2>Custom Categories</h2>
              <div style={styles.grid}>
                {customCategories.map((cat) => (
                  <div key={cat._id} style={styles.card}>
                    <div style={{ ...styles.cardHeader, backgroundColor: cat.color || '#ccc' }}>
                      <span style={styles.icon}>{cat.icon || '📦'}</span>
                      <span style={styles.cardTitle}>{cat.name}</span>
                    </div>
                    <div style={styles.cardActions}>
                      <button onClick={() => handleEdit(cat)} style={styles.smallButton}>Edit</button>
                      <button onClick={() => handleArchive(cat._id)} style={styles.smallButton}>Archive</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showArchived && archivedCategories.length > 0 && (
            <div style={styles.section}>
              <h2>Archived Categories</h2>
              <div style={styles.grid}>
                {archivedCategories.map((cat) => (
                  <div key={cat._id} style={styles.card}>
                    <div style={{ ...styles.cardHeader, backgroundColor: cat.color || '#ccc', opacity: 0.6 }}>
                      <span style={styles.icon}>{cat.icon || '📦'}</span>
                      <span style={styles.cardTitle}>{cat.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  actions: {
    display: 'flex',
    gap: '10px',
  },
  button: {
    padding: '10px 20px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: 'white',
  },
  buttonPrimary: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: 'white',
  },
  error: {
    padding: '10px',
    backgroundColor: '#fee',
    color: '#c00',
    borderRadius: '4px',
    marginBottom: '20px',
  },
  formContainer: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  input: {
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: 'white',
  },
  formActions: {
    display: 'flex',
    gap: '10px',
  },
  section: {
    marginBottom: '30px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '15px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  cardHeader: {
    padding: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  icon: {
    fontSize: '24px',
  },
  cardTitle: {
    fontWeight: '600',
  },
  cardActions: {
    padding: '10px',
    display: 'flex',
    gap: '5px',
  },
  smallButton: {
    padding: '5px 10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    backgroundColor: 'white',
  },
};

export default Categories;

