// Mock authentication service to bypass Azure AD approval requirements
export interface MockUser {
  id: string;
  name: string;
  email: string;
  username: string;
}

class MockAuthService {
  private currentUser: MockUser | null = null;
  private listeners: ((user: MockUser | null) => void)[] = [];

  constructor() {
    // Check if user was previously logged in
    const savedUser = localStorage.getItem('mockAuthUser');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
    }
  }

  login(): Promise<MockUser> {
    return new Promise((resolve) => {
      // Simulate a login process
      setTimeout(() => {
        const user: MockUser = {
          id: 'mock-user-' + Date.now(),
          name: 'Development User',
          email: 'dev@example.com',
          username: 'dev@example.com'
        };
        
        this.currentUser = user;
        localStorage.setItem('mockAuthUser', JSON.stringify(user));
        this.notifyListeners();
        resolve(user);
      }, 500); // Small delay to simulate auth
    });
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('mockAuthUser');
    this.notifyListeners();
  }

  getCurrentUser(): MockUser | null {
    return this.currentUser;
  }

  onAuthStateChanged(callback: (user: MockUser | null) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentUser));
  }
}

export const mockAuthService = new MockAuthService();