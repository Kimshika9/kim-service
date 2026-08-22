import http.server
import socketserver
import json
import sqlite3
import os
import re
import hashlib
import time
import urllib.parse
import threading

PORT = 8080
DB_FILE = "paywell.db"

# --- DATABASE SETUP ---
def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    # Users Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE,
            password_hash TEXT,
            telegram_id TEXT UNIQUE,
            telegram_username TEXT,
            balance REAL DEFAULT 0.0,
            status TEXT DEFAULT 'active',
            role TEXT DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Transactions Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS transactions (
            id TEXT PRIMARY KEY,
            sender_username TEXT NOT NULL,
            receiver_username TEXT NOT NULL,
            amount REAL NOT NULL,
            fee REAL DEFAULT 0.0,
            total REAL NOT NULL,
            type TEXT NOT NULL,
            note TEXT,
            status TEXT DEFAULT 'success',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Store Items Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS store_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            image_url TEXT,
            stock INTEGER DEFAULT -1,
            category TEXT DEFAULT 'general',
            featured INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # System Audit Logs
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            action TEXT NOT NULL,
            actor TEXT NOT NULL,
            target TEXT,
            details TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Seed Owner Account
    cursor.execute("SELECT * FROM users WHERE username = 'Yuji_luke' OR telegram_id = '6399210935'")
    owner = cursor.fetchone()
    if not owner:
        # Default password hash for owner
        pwd_hash = hashlib.sha256("OwnerPass123!".encode()).hexdigest()
        cursor.execute('''
            INSERT INTO users (username, email, password_hash, telegram_id, telegram_username, balance, role)
            VALUES ('Yuji_luke', 'yuji_luke@paywell.app', ?, '6399210935', 'Yuji_luke', 100000.0, 'owner')
        ''', (pwd_hash,))
        print("Owner account seeded: @Yuji_luke (ID: 6399210935)")

    # Seed Sample Store Items if empty
    cursor.execute("SELECT COUNT(*) FROM store_items")
    if cursor.fetchone()[0] == 0:
        sample_items = [
            ("VIP Gold Badge", "Exclusive glowing Gold Badge on your PayWell profile", 500.0, "👑", 50, "badges", 1),
            ("Custom Profile Frame", "Futuristic neon green particle frame for Mini App", 250.0, "🖼️", 100, "frames", 1),
            ("Community Speed Boost", "Priority order processing in community events", 150.0, "⚡", 200, "boosts", 0),
            ("Crown Mystery Box", "Contains random PW rewards ranging from 50 to 1000 PW", 100.0, "🎁", 500, "mystery", 1)
        ]
        cursor.executemany('''
            INSERT INTO store_items (name, description, price, image_url, stock, category, featured)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', sample_items)
        print("Sample store items seeded.")

    conn.commit()
    conn.close()

def hash_pwd(password):
    return hashlib.sha256(password.encode()).hexdigest()

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

# --- HTTP REQUEST HANDLER ---
class PayWellHTTPHandler(http.server.SimpleHTTPRequestHandler):

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def respond_json(self, data, code=200):
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        query = urllib.parse.parse_qs(parsed_url.query)

        if path.startswith('/api/'):
            self.handle_api_get(path, query)
        else:
            super().do_GET()

    def do_POST(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length) if content_length > 0 else b'{}'
        try:
            payload = json.loads(body.decode('utf-8'))
        except Exception:
            payload = {}

        if path.startswith('/api/'):
            self.handle_api_post(path, payload)
        else:
            self.respond_json({'error': 'Invalid endpoint'}, 404)

    def handle_api_get(self, path, query):
        conn = get_db()
        cursor = conn.cursor()

        if path == '/api/user':
            username = query.get('username', [None])[0]
            telegram_id = query.get('telegram_id', [None])[0]
            if username:
                cursor.execute("SELECT id, username, email, telegram_id, telegram_username, balance, status, role, created_at FROM users WHERE username = ?", (username,))
            elif telegram_id:
                cursor.execute("SELECT id, username, email, telegram_id, telegram_username, balance, status, role, created_at FROM users WHERE telegram_id = ?", (telegram_id,))
            else:
                conn.close()
                return self.respond_json({'error': 'Username or Telegram ID required'}, 400)

            user = cursor.fetchone()
            conn.close()
            if user:
                return self.respond_json({'user': dict(user)})
            else:
                return self.respond_json({'error': 'User not found'}, 404)

        elif path == '/api/transactions':
            username = query.get('username', [None])[0]
            if not username:
                conn.close()
                return self.respond_json({'error': 'Username required'}, 400)
            cursor.execute('''
                SELECT * FROM transactions
                WHERE sender_username = ? OR receiver_username = ?
                ORDER BY created_at DESC LIMIT 50
            ''', (username, username))
            rows = [dict(r) for r in cursor.fetchall()]
            conn.close()
            return self.respond_json({'transactions': rows})

        elif path == '/api/store':
            cursor.execute("SELECT * FROM store_items ORDER BY featured DESC, id DESC")
            items = [dict(r) for r in cursor.fetchall()]
            conn.close()
            return self.respond_json({'items': items})

        elif path == '/api/owner/stats':
            cursor.execute("SELECT COUNT(*) FROM users")
            total_users = cursor.fetchone()[0]
            cursor.execute("SELECT SUM(balance) FROM users")
            total_circulation = cursor.fetchone()[0] or 0.0
            cursor.execute("SELECT COUNT(*) FROM transactions")
            total_transactions = cursor.fetchone()[0]
            conn.close()
            return self.respond_json({
                'total_users': total_users,
                'total_circulation': total_circulation,
                'total_transactions': total_transactions
            })

        elif path == '/api/owner/users':
            cursor.execute("SELECT id, username, email, telegram_id, telegram_username, balance, status, role, created_at FROM users ORDER BY id DESC")
            users = [dict(r) for r in cursor.fetchall()]
            conn.close()
            return self.respond_json({'users': users})

        conn.close()
        self.respond_json({'error': 'Endpoint not found'}, 404)

    def handle_api_post(self, path, payload):
        conn = get_db()
        cursor = conn.cursor()

        if path == '/api/register':
            username = payload.get('username', '').strip()
            password = payload.get('password', '')
            email = payload.get('email', '').strip() or None
            telegram_id = payload.get('telegram_id')
            telegram_username = payload.get('telegram_username')

            if not username or len(username) < 3:
                conn.close()
                return self.respond_json({'error': 'Username must be at least 3 characters'}, 400)

            # Check existing username
            cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
            if cursor.fetchone():
                conn.close()
                return self.respond_json({'error': 'Username is already taken'}, 400)

            role = 'owner' if (username == 'Yuji_luke' or str(telegram_id) == '6399210935') else 'user'
            pwd_hash = hash_pwd(password) if password else None

            cursor.execute('''
                INSERT INTO users (username, email, password_hash, telegram_id, telegram_username, balance, role)
                VALUES (?, ?, ?, ?, ?, 0.0, ?)
            ''', (username, email, pwd_hash, telegram_id, telegram_username, role))
            conn.commit()

            cursor.execute("SELECT id, username, email, telegram_id, telegram_username, balance, status, role, created_at FROM users WHERE username = ?", (username,))
            new_user = dict(cursor.fetchone())
            conn.close()
            return self.respond_json({'success': True, 'user': new_user})

        elif path == '/api/login':
            identifier = payload.get('identifier', '').strip()
            password = payload.get('password', '')

            pwd_hash = hash_pwd(password)
            cursor.execute('''
                SELECT id, username, email, telegram_id, telegram_username, balance, status, role, password_hash
                FROM users WHERE username = ? OR email = ?
            ''', (identifier, identifier))
            user = cursor.fetchone()
            if not user or user['password_hash'] != pwd_hash:
                conn.close()
                return self.respond_json({'error': 'Invalid username/email or password'}, 401)

            if user['status'] == 'frozen':
                conn.close()
                return self.respond_json({'error': 'Account is frozen. Please contact support @Yuji_luke.'}, 403)

            user_dict = dict(user)
            del user_dict['password_hash']
            conn.close()
            return self.respond_json({'success': True, 'user': user_dict})

        elif path == '/api/transfer':
            sender_name = payload.get('sender')
            receiver_name = payload.get('receiver', '').strip()
            amount = float(payload.get('amount', 0))
            note = payload.get('note', '')

            if amount <= 0:
                conn.close()
                return self.respond_json({'error': 'Amount must be greater than 0'}, 400)

            if sender_name == receiver_name:
                conn.close()
                return self.respond_json({'error': 'Cannot send tokens to yourself'}, 400)

            cursor.execute("SELECT balance, status FROM users WHERE username = ?", (sender_name,))
            sender = cursor.fetchone()
            if not sender or sender['status'] != 'active':
                conn.close()
                return self.respond_json({'error': 'Sender account inactive or invalid'}, 400)

            if sender['balance'] < amount:
                conn.close()
                return self.respond_json({'error': 'Insufficient balance'}, 400)

            cursor.execute("SELECT balance, status FROM users WHERE username = ?", (receiver_name,))
            receiver = cursor.fetchone()
            if not receiver:
                conn.close()
                return self.respond_json({'error': f'Recipient @{receiver_name} not found'}, 404)

            # Perform Transfer
            tx_id = f"PW-{int(time.time())}-{os.urandom(2).hex().upper()}"
            cursor.execute("UPDATE users SET balance = balance - ? WHERE username = ?", (amount, sender_name))
            cursor.execute("UPDATE users SET balance = balance + ? WHERE username = ?", (amount, receiver_name))

            cursor.execute('''
                INSERT INTO transactions (id, sender_username, receiver_username, amount, fee, total, type, note)
                VALUES (?, ?, ?, ?, 0.0, ?, 'transfer', ?)
            ''', (tx_id, sender_name, receiver_name, amount, amount, note))

            conn.commit()

            cursor.execute("SELECT balance FROM users WHERE username = ?", (sender_name,))
            new_balance = cursor.fetchone()['balance']
            conn.close()

            return self.respond_json({
                'success': True,
                'tx_id': tx_id,
                'new_balance': new_balance,
                'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
            })

        elif path == '/api/store/buy':
            username = payload.get('username')
            item_id = payload.get('item_id')

            cursor.execute("SELECT * FROM store_items WHERE id = ?", (item_id,))
            item = cursor.fetchone()
            if not item:
                conn.close()
                return self.respond_json({'error': 'Item not found'}, 404)

            if item['stock'] == 0:
                conn.close()
                return self.respond_json({'error': 'Item out of stock'}, 400)

            price = item['price']
            cursor.execute("SELECT balance FROM users WHERE username = ?", (username,))
            user = cursor.fetchone()
            if not user or user['balance'] < price:
                conn.close()
                return self.respond_json({'error': 'Insufficient PW balance'}, 400)

            tx_id = f"PW-STORE-{int(time.time())}-{os.urandom(2).hex().upper()}"
            cursor.execute("UPDATE users SET balance = balance - ? WHERE username = ?", (price, username))
            if item['stock'] > 0:
                cursor.execute("UPDATE store_items SET stock = stock - 1 WHERE id = ?", (item_id,))

            cursor.execute('''
                INSERT INTO transactions (id, sender_username, receiver_username, amount, fee, total, type, note)
                VALUES (?, ?, 'PayWell Store', ?, 0.0, ?, 'store_purchase', ?)
            ''', (tx_id, username, price, price, f"Purchased {item['name']}"))

            conn.commit()
            cursor.execute("SELECT balance FROM users WHERE username = ?", (username,))
            new_balance = cursor.fetchone()['balance']
            conn.close()

            return self.respond_json({
                'success': True,
                'tx_id': tx_id,
                'item': dict(item),
                'new_balance': new_balance
            })

        elif path == '/api/owner/pin':
            pin = str(payload.get('pin', ''))
            owner_id = str(payload.get('telegram_id', ''))
            owner_username = str(payload.get('username', ''))

            if pin == "201171" and (owner_id == "6399210935" or owner_username == "Yuji_luke"):
                conn.close()
                return self.respond_json({'success': True, 'authenticated': True})
            else:
                conn.close()
                return self.respond_json({'error': 'Invalid Owner PIN or unauthorized identity'}, 401)

        elif path == '/api/owner/adjust-balance':
            actor = payload.get('actor', 'Yuji_luke')
            target_username = payload.get('target_username')
            amount = float(payload.get('amount', 0))
            action_type = payload.get('type') # 'add' or 'deduct'
            reason = payload.get('reason', 'Owner modification')

            cursor.execute("SELECT balance FROM users WHERE username = ?", (target_username,))
            target = cursor.fetchone()
            if not target:
                conn.close()
                return self.respond_json({'error': 'Target user not found'}, 404)

            if action_type == 'deduct' and target['balance'] < amount:
                conn.close()
                return self.respond_json({'error': 'Cannot deduct more than user current balance'}, 400)

            tx_id = f"PW-OWNER-{int(time.time())}-{os.urandom(2).hex().upper()}"
            if action_type == 'add':
                cursor.execute("UPDATE users SET balance = balance + ? WHERE username = ?", (amount, target_username))
                sender, receiver = "System Owner", target_username
            else:
                cursor.execute("UPDATE users SET balance = balance - ? WHERE username = ?", (amount, target_username))
                sender, receiver = target_username, "System Deduction"

            cursor.execute('''
                INSERT INTO transactions (id, sender_username, receiver_username, amount, fee, total, type, note)
                VALUES (?, ?, ?, ?, 0.0, ?, ?, ?)
            ''', (tx_id, sender, receiver, amount, amount, f"owner_{action_type}", reason))

            cursor.execute('''
                INSERT INTO audit_logs (action, actor, target, details)
                VALUES (?, ?, ?, ?)
            ''', (f"balance_{action_type}", actor, target_username, f"{amount} PW. Reason: {reason}"))

            conn.commit()
            cursor.execute("SELECT balance FROM users WHERE username = ?", (target_username,))
            new_balance = cursor.fetchone()['balance']
            conn.close()

            return self.respond_json({
                'success': True,
                'target_username': target_username,
                'new_balance': new_balance,
                'tx_id': tx_id
            })

        elif path == '/api/owner/user-status':
            target_username = payload.get('target_username')
            status = payload.get('status') # 'active' or 'frozen'

            cursor.execute("UPDATE users SET status = ? WHERE username = ?", (status, target_username))
            cursor.execute("INSERT INTO audit_logs (action, actor, target, details) VALUES (?, 'Yuji_luke', ?, ?)",
                           ('status_change', target_username, f"Status changed to {status}"))
            conn.commit()
            conn.close()
            return self.respond_json({'success': True, 'status': status})

        elif path == '/api/owner/reset-password':
            target_username = payload.get('target_username')
            new_password = payload.get('new_password', 'PayWell2024!')

            new_hash = hash_pwd(new_password)
            cursor.execute("UPDATE users SET password_hash = ? WHERE username = ?", (new_hash, target_username))
            cursor.execute("INSERT INTO audit_logs (action, actor, target, details) VALUES ('password_reset', 'Yuji_luke', ?, 'Password reset by owner')",
                           (target_username,))
            conn.commit()
            conn.close()
            return self.respond_json({'success': True, 'new_password': new_password})

        conn.close()
        self.respond_json({'error': 'Invalid POST endpoint'}, 404)

def run_server():
    init_db()
    with socketserver.TCPServer(("", PORT), PayWellHTTPHandler) as httpd:
        print(f"PayWell Backend Server running on http://localhost:{PORT}")
        httpd.serve_forever()

if __name__ == "__main__":
    if not os.path.exists("index.html"):
        print("Warning: index.html not found in current working directory.")

    server_thread = threading.Thread(target=run_server)
    server_thread.daemon = True
    server_thread.start()

    print("--- PayWell Premium Payment System Backend Started ---")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down PayWell Server...")
