# TOTP 2FA Login Demo / ตัวอย่างการเข้าสู่ระบบด้วย TOTP

This project demonstrates how to add Time‑based One‑Time Password (TOTP) two‑factor authentication (2FA) to a web application's login flow using a simple JavaScript snippet and a Node.js backend. The goal is to provide an example of how to drop in a script on your login page that communicates with a server to perform 2FA verification.

โครงการนี้เป็นตัวอย่างการเพิ่มระบบตรวจสอบตัวตนแบบสองปัจจัย (2FA) ด้วยรหัสครั้งเดียวตามเวลา (TOTP) ให้กับหน้าล็อกอินของเว็บแอปพลิเคชัน โดยใช้สคริปต์ JavaScript ง่าย ๆ ที่ติดต่อกับเซิร์ฟเวอร์ Node.js เพื่อยืนยันรหัส 2FA

> **Note / หมายเหตุ:** This demo stores user data and TOTP secrets in memory. For real‑world use you should persist user accounts and TOTP secrets in a secure database and use hashed passwords. / โค้ดตัวอย่างนี้เก็บข้อมูลผู้ใช้และความลับ TOTP ไว้ในหน่วยความจำ ในการใช้งานจริงควรจัดเก็บในฐานข้อมูลที่ปลอดภัยและใช้รหัสผ่านแบบแฮช

## Features

* User login with username and password. / ผู้ใช้เข้าสู่ระบบด้วยชื่อผู้ใช้และรหัสผ่าน
* Automatic TOTP secret generation on a user's first login. / สร้างความลับ TOTP อัตโนมัติเมื่อผู้ใช้ล็อกอินครั้งแรก
* QR code generation for easy setup with authenticator apps (e.g. Google Authenticator, Microsoft Authenticator). / สร้างคิวอาร์โค้ดเพื่อให้ง่ายต่อการตั้งค่ากับแอปยืนยันตัวตน เช่น Google Authenticator หรือ Microsoft Authenticator
* Verification of TOTP codes on subsequent logins. / ตรวจสอบรหัส TOTP ในการล็อกอินครั้งถัดไป
* Client‑side JavaScript snippet that can be embedded on your existing login page. / สคริปต์ฝั่งไคลเอนต์ที่สามารถฝังลงในหน้าล็อกอินที่มีอยู่ได้

## Getting Started

### Prerequisites

You will need [Node.js](https://nodejs.org/) installed on your machine. This project was developed with Node.js 18 but should work with any modern version of Node.js.

ต้องติดตั้ง [Node.js](https://nodejs.org/) ในเครื่อง โปรเจกต์นี้พัฒนาด้วย Node.js 18 แต่สามารถใช้งานกับเวอร์ชันใหม่ ๆ ได้

### Installation

1. Clone this repository or download the source code. / โคลนรีโพสิตอรีนี้หรือดาวน์โหลดซอร์สโค้ด

2. Install dependencies: / ติดตั้งไลบรารีที่ต้องใช้

   ```bash
   npm install
   ```

3. Start the server: / เริ่มเซิร์ฟเวอร์

   ```bash
   npm start
   ```

4. Open your browser and navigate to [http://localhost:9500](http://localhost:9500). / เปิดเบราว์เซอร์และไปที่ [http://localhost:9500](http://localhost:9500)

### Usage

1. Enter a username and password on the login page and click **Login**. / กรอกชื่อผู้ใช้และรหัสผ่านในหน้าล็อกอินแล้วคลิก **Login**

2. On your first login, the server will generate a TOTP secret for your account and return a QR code. Scan this QR code with your authenticator app. / เมื่อเข้าสู่ระบบครั้งแรก เซิร์ฟเวอร์จะสร้างความลับ TOTP ให้บัญชีของคุณและส่งคิวอาร์โค้ด ให้สแกนด้วยแอปยืนยันตัวตน

3. After scanning, enter the 6‑digit code displayed in your authenticator app and click **Login** again to complete setup. / หลังจากสแกน ให้กรอกรหัส 6 หลักจากแอปยืนยันตัวตนแล้วคลิก **Login** อีกครั้งเพื่อเสร็จสิ้นการตั้งค่า

4. On subsequent logins, you'll be asked to enter the 6‑digit code after providing your username and password. / ในการเข้าสู่ระบบครั้งต่อ ๆ ไป คุณจะถูกขอให้กรอกรหัส 6 หลักหลังจากกรอกชื่อผู้ใช้และรหัสผ่าน

The client‑side JavaScript that drives this flow is located in `public/login.js`. It communicates with two backend endpoints. / สคริปต์ฝั่งไคลเอนต์ที่ทำงานตามลำดับนี้อยู่ใน `public/login.js` และติดต่อกับสองเอ็นด์พอยต์ฝั่งเซิร์ฟเวอร์:

* `POST /login` — verifies username/password and, if necessary, generates a new TOTP secret and QR code. / ตรวจสอบชื่อผู้ใช้และรหัสผ่าน และถ้าจำเป็นให้สร้างความลับ TOTP ใหม่และคิวอาร์โค้ด
* `POST /verify-totp` — verifies the submitted TOTP token against the stored secret. / ตรวจสอบรหัส TOTP ที่ส่งเข้ามากับความลับที่บันทึกไว้

## Embedding on Your Own Login Page

To integrate TOTP 2FA into your own login page: / วิธีการนำ TOTP 2FA ไปใช้กับหน้าล็อกอินของคุณ

1. Serve the `login.js` file to your page. You can either copy it into your project's static assets or host it on your own domain. The script supports configuration via query parameters or `data-` attributes on the `<script>` tag. / ให้บริการไฟล์ `login.js` ในหน้าของคุณ โดยสามารถคัดลอกไปยังทรัพยากรของโปรเจกต์หรือโฮสต์ไว้บนโดเมนของคุณเอง สคริปต์สามารถกำหนดค่าผ่านพารามิเตอร์ใน URL หรือ `data-` attribute บนแท็ก `<script>`

2. Ensure that your login form has input fields with the IDs `username`, `password` and optionally `token`, as well as a submit button with the ID `submit-button`. See `public/index.html` for an example structure. / ตรวจสอบให้แบบฟอร์มล็อกอินของคุณมีช่องกรอกที่มี `id` เป็น `username`, `password` และ `token` (ถ้ามี) พร้อมปุ่มส่งแบบฟอร์มที่มี `id` เป็น `submit-button` ดูตัวอย่างโครงสร้างได้ใน `public/index.html`

3. Include the script tag at the end of your login page. You can specify the backend domain to contact and a default username via query parameters or `data-` attributes. For example: / แทรกแท็กสคริปต์ในตอนท้ายของหน้าล็อกอิน โดยสามารถระบุโดเมนของเซิร์ฟเวอร์และชื่อผู้ใช้เริ่มต้นผ่านพารามิเตอร์หรือ `data-` attribute เช่น:

   ```html
   <!-- Hosted locally -->
   <script src="/path/to/login.js"></script>

   <!-- Hosted from an external domain with configuration -->
   <script src="https://web.tunableproject.com/path/to/login.js?site=example.com&user=john"></script>
   <!-- Alternatively using data attributes -->
   <script src="https://web.tunableproject.com/path/to/login.js" data-site="example.com" data-user="john"></script>
   ```

   The `site` parameter tells the script where to send the `/login` and `/verify-totp` API requests. If omitted, requests will be made relative to the current origin. The `user` parameter pre‑fills the username field and makes it read‑only. / พารามิเตอร์ `site` บอกสคริปต์ให้ส่งคำขอ API `/login` และ `/verify-totp` ไปที่ใด หากไม่ระบุ คำขอจะถูกส่งภายใต้โดเมนปัจจุบัน ส่วนพารามิเตอร์ `user` จะเติมค่าในช่องชื่อผู้ใช้และล็อกไม่ให้แก้ไข

4. Implement the backend endpoints (`/login` and `/verify-totp`) on your server using the logic demonstrated in `server.js`. Use a package such as [`speakeasy`](https://github.com/speakeasyjs/speakeasy) to generate and verify TOTP tokens. / สร้างเอ็นด์พอยต์ (`/login` และ `/verify-totp`) บนเซิร์ฟเวอร์ของคุณตามตัวอย่างใน `server.js` โดยใช้ไลบรารีเช่น [`speakeasy`](https://github.com/speakeasyjs/speakeasy) เพื่อสร้างและตรวจสอบรหัส TOTP

5. Store each user's TOTP secret securely and ensure that it is associated with their account. Never expose the secret to the client. / เก็บความลับ TOTP ของแต่ละผู้ใช้อย่างปลอดภัยและเชื่อมโยงกับบัญชีผู้ใช้อย่างถูกต้อง อย่าเปิดเผยความลับนี้ให้กับฝั่งไคลเอนต์

## Security Considerations

This repository is a demonstration and does not address all security concerns. For production systems you should also: / โปรเจกต์นี้เป็นเพียงตัวอย่างและยังไม่ได้ครอบคลุมประเด็นความปลอดภัยทั้งหมด หากนำไปใช้จริงควรพิจารณาเพิ่มเติมดังนี้:

* Use TLS/HTTPS to encrypt all communications. / ใช้ TLS/HTTPS เพื่อเข้ารหัสข้อมูลทั้งหมดที่รับส่ง
* Hash and salt user passwords instead of storing them as plain text. / แฮชและใส่เกลือให้กับรหัสผ่าน แทนที่จะเก็บเป็นข้อความธรรมดา
* Implement proper session management (e.g. using secure cookies or tokens). / จัดการเซสชันอย่างเหมาะสม เช่น การใช้คุกกี้แบบปลอดภัยหรือโทเค็น
* Protect against brute force attacks by rate limiting login attempts. / ป้องกันการโจมตีแบบเดารหัสผ่านด้วยการจำกัดจำนวนครั้งที่ล็อกอินได้
* Store TOTP secrets securely (e.g. encrypted at rest). / เก็บความลับ TOTP อย่างปลอดภัย เช่น เข้ารหัสเมื่อจัดเก็บ

## License

This project is licensed under the MIT license.