const fs = require('fs');
const path = './src/context/AppContext.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Restore user from JWT if exists
content = content.replace(
  'const [currentUser, setCurrentUser] = useState(null); // Default: null (no logged in user)',
  `const [currentUser, setCurrentUser] = useState(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('authToken');
        return null;
      }
      // Kita perlu 'name' dan 'pin' jika UI membutuhkannya, tapi kita fallback ke username dulu
      return { id: payload.id, username: payload.username, role: payload.role, name: payload.username };
    } catch (e) {
      return null;
    }
  });`
);

// 2. Add authFetch helper
const authFetchStr = `  const authFetch = async (url, options = {}) => {
    const token = localStorage.getItem('authToken');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (token) headers['Authorization'] = \`Bearer \${token}\`;

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const fullUrl = url.startsWith('http') ? url : \`\${API_URL}\${url}\`;

    const response = await fetch(fullUrl, { ...options, headers });
    
    // Jika auth gagal (kecuali saat coba login/get users awal), logout otomatis
    if ((response.status === 401 || response.status === 403) && url !== '/api/users' && url !== '/api/login') {
      localStorage.removeItem('authToken');
      setCurrentUser(null);
      throw new Error('Sesi kedaluwarsa');
    }
    return response;
  };
`;

content = content.replace(
  'const [usersList, setUsersList] = useState([]); // Will be fetched from backend',
  'const [usersList, setUsersList] = useState([]);\n\n' + authFetchStr
);

// 3. Replace all fetch calls
content = content.replace(/fetch\('http:\/\/localhost:3001(\/api\/[^']+)'/g, "authFetch('$1'");
content = content.replace(/fetch\(\`http:\/\/localhost:3001(\/api\/[^\`]+)\`/g, "authFetch(`$1`");

// 4. Update the quick logout in App.jsx to use clear token! Wait, App.jsx handles logout. We should export a helper or just modify App.jsx later.
// Let's add handleLogout
const logoutFunc = `
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setCurrentUser(null);
  };
`;
content = content.replace('const addUser = (newUser) => {', logoutFunc + '\n  const addUser = (newUser) => {');
content = content.replace('setCurrentUser,', 'setCurrentUser,\n        handleLogout,');

fs.writeFileSync(path, content);
console.log('AppContext.jsx rewritten successfully.');
