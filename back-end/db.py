import os
import json
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ConfigurationError
from bson import ObjectId
from datetime import datetime

# MongoDB connection
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/genai-quiz")

use_mock_db = False
try:
    client = MongoClient(MONGODB_URI)
    # Specify database name explicitly
    db = client['genai-quiz']  # Use explicit database name
    
    # Test connection
    client.admin.command('ismaster')
    print("✅ MongoDB connected successfully")
    
except (ConnectionFailure, ConfigurationError) as e:
    print(f"❌ MongoDB connection failed: {e}")
    print("🔄 Using mock database for development")
    use_mock_db = True

class MockCursor:
    """Mock cursor that supports sorting like PyMongo cursor"""
    def __init__(self, data):
        self._data = data
        
    def sort(self, field, direction=1):
        """Sort the data by field. direction: 1=ascending, -1=descending"""
        reverse = (direction == -1)
        
        def get_sort_key(doc):
            value = doc.get(field)
            # Handle datetime objects
            if isinstance(value, datetime):
                return value.timestamp()
            # Handle None values
            if value is None:
                return 0 if not reverse else float('inf')
            return value
            
        sorted_data = sorted(self._data, key=get_sort_key, reverse=reverse)
        return MockCursor(sorted_data)
    
    def __iter__(self):
        """Make cursor iterable"""
        return iter(self._data)
    
    def __next__(self):
        """Support next() function"""
        return next(iter(self._data))

class PersistentMockCollection:
    def __init__(self, filename):
        self.filename = f"mock_data_{filename}.json"
        self._data = self._load_data()
    
    def _load_data(self):
        if os.path.exists(self.filename):
            try:
                with open(self.filename, 'r') as f:
                    data = json.load(f)
                    # Convert datetime strings back to datetime objects
                    for item in data:
                        if 'created_at' in item and isinstance(item['created_at'], str):
                            item['created_at'] = datetime.fromisoformat(item['created_at'].replace('Z', '+00:00'))
                    return data
            except:
                pass
        return []
    
    def _save_data(self):
        # Convert datetime objects to strings for JSON serialization
        data_to_save = []
        for item in self._data:
            item_copy = dict(item)
            if 'created_at' in item_copy and hasattr(item_copy['created_at'], 'isoformat'):
                item_copy['created_at'] = item_copy['created_at'].isoformat()
            data_to_save.append(item_copy)
        
        with open(self.filename, 'w') as f:
            json.dump(data_to_save, f, indent=2)
    
    def insert_one(self, doc):
        new_doc = dict(doc)
        new_doc["_id"] = "mock_id_12345"
        self._data.append(new_doc)
        self._save_data()  # Save after insert
        
        class MockResult:
            inserted_id = "mock_id_12345"
        return MockResult()

class MockCollection:
    def __init__(self):
        self._data = []
        
    def find_one(self, query):
        print(f"🔍 MockCollection.find_one called with query: {query}")
        print(f"🔍 Current data in collection: {len(self._data)} documents")
        
        if not query:
            return self._data[0] if self._data else None
            
        # Handle email-based queries (for login)
        if query.get("email"):
            for user in self._data:
                if query.get("email") == user.get("email"):
                    print(f"🔍 Found user by email: {user}")
                    return user
                    
        # Handle _id-based queries (for /api/auth/me)
        if query.get("_id"):
            for user in self._data:
                if query.get("_id") == user.get("_id"):
                    print(f"🔍 Found user by _id: {user}")
                    return user
        
        # ✅ FIX: Handle studentId queries (THIS WAS MISSING!)
        if query.get("studentId"):
            for doc in self._data:
                if doc.get("studentId") == query.get("studentId"):
                    print(f"🔍 Found profile by studentId: {doc}")
                    return doc
        
        # Handle multiple field queries (for quiz submission)
        if len(query) > 1:
            for doc in self._data:
                match = True
                for key, value in query.items():
                    if doc.get(key) != value:
                        match = False
                        break
                if match:
                    print(f"🔍 Found document: {doc}")
                    return doc
        
        # ✅ FIX: Handle any single field query (fallback)
        for key, value in query.items():
            for doc in self._data:
                if doc.get(key) == value:
                    print(f"🔍 Found document by {key}: {doc}")
                    return doc
                    
        print("🔍 No document found matching query")
        return None
        
    def insert_one(self, doc):
        print(f"🔍 MockCollection.insert_one called with doc keys: {list(doc.keys())}")
        
        # ✅ PREVENT DUPLICATES: Check for existing documents
        unique_fields = ['email', 'studentId']
        for field in unique_fields:
            if field in doc:
                existing = self.find_one({field: doc[field]})
                if existing:
                    print(f"❌ Duplicate {field} found: {doc[field]}")
                    raise Exception(f"Duplicate {field}: {doc[field]}")
        
        # Create a copy to avoid reference issues
        new_doc = dict(doc)
        new_doc["_id"] = f"mock_id_{len(self._data)+1}"  # ✅ Unique IDs
        self._data.append(new_doc)
        print(f"🔍 Data after insert: {len(self._data)} documents")
        
        class MockResult:
            inserted_id = new_doc["_id"]
        return MockResult()

    def find(self, query=None):
        """Return a MockCursor that supports sorting"""
        if query is None:
            filtered_data = self._data
        else:
            filtered_data = []
            for doc in self._data:
                match = True
                for key, value in query.items():
                    if doc.get(key) != value:
                        match = False
                        break
                if match:
                    filtered_data.append(doc)
        
        print(f"🔍 MockCollection.find returned {len(filtered_data)} documents")
        return MockCursor(filtered_data)

    def count_documents(self, query=None):
        if query is None:
            return len(self._data)
        
        count = 0
        for doc in self._data:
            match = True
            for key, value in query.items():
                if doc.get(key) != value:
                    match = False
                    break
            if match:
                count += 1
        return count

    def estimated_document_count(self):
        return len(self._data)

    def create_index(self, *args, **kwargs):
        """Mock index creation - logs but doesn't actually create indexes"""
        print(f"📝 Mock database: create_index called with {args}, {kwargs}")
        pass

    def find_one_and_update(self, filter_query, update_query):
        """Mock find_one_and_update method"""
        doc = self.find_one(filter_query)
        if doc:
            # Apply updates (simplified implementation)
            for key, value in update_query.get("$set", {}).items():
                doc[key] = value
            print(f"🔄 Updated document: {doc}")
        return doc

    def update_one(self, filter_query, update_data, upsert=False):
        """✅ CRITICAL FIX: Add missing update_one method"""
        try:
            print(f"🔄 MockCollection.update_one called with filter: {filter_query}")
            
            # Find document to update
            doc_found = False
            for doc in self._data:
                # Check if document matches filter
                match = True
                for key, value in filter_query.items():
                    if doc.get(key) != value:
                        match = False
                        break
                
                if match:
                    doc_found = True
                    # Apply $set operations
                    if '$set' in update_data:
                        for key, value in update_data['$set'].items():
                            # Handle nested keys like 'profile.skillLevel'
                            if '.' in key:
                                keys = key.split('.')
                                current = doc
                                for k in keys[:-1]:
                                    if k not in current:
                                        current[k] = {}
                                    current = current[k]
                                current[keys[-1]] = value
                            else:
                                doc[key] = value
                    
                    # Apply $inc operations (increment)
                    if '$inc' in update_data:
                        for key, value in update_data['$inc'].items():
                            if '.' in key:
                                keys = key.split('.')
                                current = doc
                                for k in keys[:-1]:
                                    if k not in current:
                                        current[k] = {}
                                    current = current[k]
                                current[keys[-1]] = current.get(keys[-1], 0) + value
                            else:
                                doc[key] = doc.get(key, 0) + value
                    
                    # Apply $push operations (add to array)
                    if '$push' in update_data:
                        for key, value in update_data['$push'].items():
                            if '.' in key:
                                keys = key.split('.')
                                current = doc
                                for k in keys[:-1]:
                                    if k not in current:
                                        current[k] = {}
                                    current = current[k]
                                if keys[-1] not in current:
                                    current[keys[-1]] = []
                                current[keys[-1]].append(value)
                            else:
                                if key not in doc:
                                    doc[key] = []
                                doc[key].append(value)
                    
                    print(f"🔄 Updated document: {doc.get('_id', 'unknown')}")
                    return {"matched_count": 1, "modified_count": 1}
            
            # If no document found and upsert=True, create new document
            if not doc_found and upsert:
                new_doc = dict(filter_query)
                new_doc["_id"] = f"mock_id_{len(self._data)+1}"
                
                if '$set' in update_data:
                    for key, value in update_data['$set'].items():
                        if '.' in key:
                            keys = key.split('.')
                            current = new_doc
                            for k in keys[:-1]:
                                if k not in current:
                                    current[k] = {}
                                current = current[k]
                            current[keys[-1]] = value
                        else:
                            new_doc[key] = value
                
                self._data.append(new_doc)
                print(f"🆕 Created new document via upsert: {new_doc['_id']}")
                return {"matched_count": 0, "modified_count": 0, "upserted_id": new_doc["_id"]}
            
            # No document found and no upsert
            print(f"❌ No document found for filter: {filter_query}")
            return {"matched_count": 0, "modified_count": 0}
            
        except Exception as e:
            print(f"❌ MockCollection update_one error: {e}")
            return {"matched_count": 0, "modified_count": 0}

if use_mock_db:
    # Mock collections - Enhanced with duplicate prevention
    users_col = MockCollection()
    courses_col = MockCollection()
    quizzes_col = MockCollection()
    attempts_col = MockCollection()
    events_col = MockCollection()
    profiles_col = MockCollection()
    templates_col = MockCollection()

    def ensure_indexes():
        print("📝 Mock database - indexes skipped (duplicate prevention built-in)")
        pass
else:
    # Real database collections
    users_col = db.users
    courses_col = db.courses
    quizzes_col = db.quizzes
    attempts_col = db.attempts
    events_col = db.events
    profiles_col = db.profiles
    templates_col = db.templates
    
    def ensure_indexes():
        try:
            # ✅ CREATE UNIQUE INDEXES TO PREVENT DUPLICATES
            users_col.create_index("email", unique=True)
            profiles_col.create_index("studentId", unique=True)  # ✅ PREVENT DUPLICATE PROFILES
            templates_col.create_index("user_id")
            
            # Additional useful indexes
            quizzes_col.create_index("user_id")
            attempts_col.create_index("user_id")
            courses_col.create_index("instructor_id")
            
            print("📋 Database indexes created successfully")
        except Exception as e:
            print(f"⚠️ Index creation failed: {e}")
