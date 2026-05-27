const STORAGE_KEY = 'knoukno_frontend_workspace';

const initialState = {
  businessTitle: '',
  answers: [],
  grades: [],
  ratings: [],
  averageHistory: []
};

export function loadWorkspace() {
  if (typeof window === 'undefined') {
    return initialState;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return initialState;
    }

    const parsed = JSON.parse(raw);
    return {
      ...initialState,
      ...parsed
    };
  } catch (error) {
    return initialState;
  }
}

export function saveWorkspace(nextState) {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
}

export function clearWorkspace() {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
}
