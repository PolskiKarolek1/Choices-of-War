// bug.js

// Lijst waarin alle geregistreerde bugs worden opgeslagen
export const bugList = [];

// Vaste categorieën en niveaus om tikfouten te voorkomen
export const SEVERITY_LEVELS = ['low', 'medium', 'high', 'critical'];
export const STATUS_TYPES = ['open', 'in-progress', 'resolved'];

/**
 * Maakt een nieuwe bug aan met een uniek ID en standaardstatus.
 */
export function createBug({ title, description, severity, category, reportedBy }) {
  if (!SEVERITY_LEVELS.includes(severity)) {
    throw new Error(`Ongeldige severity: ${severity}. Kies uit: ${SEVERITY_LEVELS.join(', ')}`);
  }

  const newBug = {
    id: `BUG-${String(bugList.length + 1).padStart(3, '0')}`,
    title,
    description,
    severity,
    status: 'open',
    category,
    reportedBy,
    timestamp: new Date().toISOString()
  };

  bugList.push(newBug);
  return newBug;
}

/**
 * Filtert bugs op basis van ernst (bijv. 'critical')
 */
export function getBugsBySeverity(bugs, severity) {
  return bugs.filter(bug => bug.severity.toLowerCase() === severity.toLowerCase());
}

/**
 * Filtert bugs op basis van status (bijv. 'open')
 */
export function getBugsByStatus(bugs, status) {
  return bugs.filter(bug => bug.status.toLowerCase() === status.toLowerCase());
}

/**
 * Generieke filterfunctie om op meerdere criteria tegelijk te filteren
 * Voorbeeld van criteria: { status: 'open', severity: 'high' }
 */
export function filterBugs(bugs, criteria = {}) {
  return bugs.filter(bug => {
    return Object.keys(criteria).every(key => {
      if (!criteria[key]) return true;
      return String(bug[key]).toLowerCase() === String(criteria[key]).toLowerCase();
    });
  });
}
