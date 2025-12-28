import React, { useState, useEffect } from 'react';
import { personService, CreatePersonData } from '../services/personService';
import { Person } from '../types/account.types';

const People: React.FC = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [formData, setFormData] = useState<CreatePersonData>({
    name: '',
    type: 'other',
    notes: '',
  });

  useEffect(() => {
    loadPeople();
  }, []);

  const loadPeople = async () => {
    try {
      setLoading(true);
      const data = await personService.getPeople();
      setPeople(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load people');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPerson) {
        await personService.updatePerson(editingPerson._id, formData);
      } else {
        await personService.createPerson(formData);
      }
      setShowForm(false);
      setEditingPerson(null);
      setFormData({ name: '', type: 'other', notes: '' });
      loadPeople();
    } catch (err: any) {
      setError(err.message || 'Failed to save person');
    }
  };

  const handleEdit = (person: Person) => {
    setEditingPerson(person);
    setFormData({
      name: person.name,
      type: person.type,
      notes: person.notes || '',
      overallLimit: person.overallLimit,
      limitPeriod: person.limitPeriod,
      categoryLimits: person.categoryLimits,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this person?')) {
      try {
        await personService.deletePerson(id);
        loadPeople();
      } catch (err: any) {
        setError(err.message || 'Failed to delete person');
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>People</h1>
        <button onClick={() => { setShowForm(true); setEditingPerson(null); setFormData({ name: '', type: 'other', notes: '' }); }} style={styles.buttonPrimary}>
          + Add Person
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {showForm && (
        <div style={styles.formContainer}>
          <h2>{editingPerson ? 'Edit Person' : 'Create Person'}</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label>Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label>Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                style={styles.input}
              >
                <option value="child">Child</option>
                <option value="friend">Friend</option>
                <option value="employee">Employee</option>
                <option value="family">Family</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                style={styles.input}
                rows={3}
              />
            </div>
            <div style={styles.formGroup}>
              <label>Overall Spending Limit</label>
              <input
                type="number"
                value={formData.overallLimit || ''}
                onChange={(e) => setFormData({ ...formData, overallLimit: e.target.value ? parseFloat(e.target.value) : undefined })}
                style={styles.input}
                min="0"
                step="0.01"
              />
            </div>
            <div style={styles.formGroup}>
              <label>Limit Period</label>
              <select
                value={formData.limitPeriod || 'monthly'}
                onChange={(e) => setFormData({ ...formData, limitPeriod: e.target.value as any })}
                style={styles.input}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div style={styles.formActions}>
              <button type="submit" style={styles.buttonPrimary}>Save</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingPerson(null); }} style={styles.button}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div style={styles.grid}>
          {people.map((person) => (
            <div key={person._id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3>{person.name}</h3>
                <span style={styles.badge}>{person.type}</span>
              </div>
              {person.notes && <p style={styles.notes}>{person.notes}</p>}
              {person.overallLimit && (
                <div style={styles.limitInfo}>
                  <strong>Limit:</strong> {person.overallLimit} INR / {person.limitPeriod}
                </div>
              )}
              <div style={styles.cardActions}>
                <button onClick={() => handleEdit(person)} style={styles.smallButton}>Edit</button>
                <button onClick={() => handleDelete(person._id)} style={styles.smallButton}>Delete</button>
              </div>
            </div>
          ))}
        </div>
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
  button: {
    padding: '10px 20px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: 'white',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '15px',
  },
  card: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  badge: {
    padding: '4px 8px',
    backgroundColor: '#e0e0e0',
    borderRadius: '4px',
    fontSize: '12px',
  },
  notes: {
    color: '#666',
    fontSize: '14px',
    marginBottom: '10px',
  },
  limitInfo: {
    fontSize: '14px',
    marginBottom: '10px',
  },
  cardActions: {
    display: 'flex',
    gap: '5px',
    marginTop: '10px',
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

export default People;

