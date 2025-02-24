# Online-Code-Compiler
Online Code Compiler 🚀
An interactive online code compiler supporting C, C++, Java, and Python with real-time execution and error handling.

Features ✨
✅ Supports multiple languages (C, C++, Java, Python).
✅ Real-time code execution using Judge0 API.
✅ Displays execution time and memory usage.
✅ Error handling with suggestions for debugging.
✅ Dark & Light mode toggle using Material-UI.
✅ Code editor with syntax highlighting (CodeMirror).
✅ Responsive design with MUI components.

Tech Stack 🛠
Frontend: React, CodeMirror, MUI
Backend: Node.js, Express, Axios
API: Judge0 API
Deployment: Vercel (Frontend), Render (Backend)

Installation & Setup 🏗

1️⃣ Clone the Repository
git clone https://github.com/sankky07/online-code-compiler.git
cd online-code-compiler

2️⃣ Install Dependencies
Frontend

cd frontend
npm install

Backend

cd backend
npm install

3️⃣ Start the Server
cd backend
node server.js

4️⃣ Start the React App
cd frontend
npm start
The compiler will be available at http://localhost:3000.

Usage Instructions 🎯
1️⃣ Select a programming language from the dropdown.
2️⃣ Write or modify the Hello World program in the editor.
3️⃣ Provide input (optional) in the input box.
4️⃣ Click "Run Code" to execute.
5️⃣ View the output, execution time, memory usage, or any errors.
6️⃣ Toggle between Dark & Light mode.

Backend API Details 🌐
The backend sends the code to Judge0 API for execution.

POST /execute
Request:

json
Copy
Edit
{
  "code": "print('Hello, World!')",
  "language": "Python",
  "input": ""
}

Response:

json
Copy
Edit
{
  "output": "Hello, World!\n",
  "executionTime": "0.03s",
  "memoryUsage": "12KB"
}


Deployment Guide 🚀
Frontend (Vercel/Netlify)
Go to Vercel or Netlify.
Link your GitHub repo.
Deploy the frontend.
Backend (Render/AWS/Heroku)
Create a Render service.
Link your backend repo.
Deploy the backend.
Update the frontend to use the deployed API.

Future Improvements 🔥
🚀 Real-time collaboration using WebSockets.
🚀 User authentication & code history.
🚀 Support for more programming languages.

Contributing 🤝
Fork the repo.
Create a new branch (git checkout -b feature-name).
Commit changes (git commit -m "Added new feature").
Push the branch (git push origin feature-name).
Create a Pull Request.
License 📝
This project is open-source under the MIT License.

💡 Made with ❤️ by [Sanket]
Let me know if you need any modifications! 🚀🔥
