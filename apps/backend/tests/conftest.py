import os
import sys
from pathlib import Path

# Settings are read at import time, so provide dummy values before the app is imported.
for key, value in {
    "MONGO_URL": "mongodb://localhost",
    "MONGO_DB": "test",
    "ADMIN_PASSWORD": "x",
    "MAIL_USERNAME": "x",
    "MAIL_PASSWORD": "x",
    "MAIL_FROM": "noreply@example.com",
    "RAZORPAY_KEY_ID": "x",
    "RAZORPAY_KEY_SECRET": "x",
}.items():
    os.environ.setdefault(key, value)

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
