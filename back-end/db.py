import os
import json
from pymongo import MongoClient, ReturnDocument
from pymongo.errors import ConnectionFailure, ConfigurationError
from bson import ObjectId
from datetime import datetime

# MongoDB connection
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/genai-quiz")

use_mock_db = False
try:
    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=2000)
    # Specify database name explicitly
    db = client['genai-quiz']
    
    # Test connection
    client.admin.command('ismaster')
    print("✅ MongoDB connected successfully")
    
except (ConnectionFailure, ConfigurationError) as e:
    print(f"❌ MongoDB connection failed: {e}")
    if os.getenv("FLASK_ENV") == "production":
        raise Exception("MongoDB is required in production deployment. Please configure MONGODB_URI.")
    print("🔄 Using persistent mock database for development")
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
    
    def limit(self, n):
        """Limit the number of results"""
        return MockCursor(self._data[:n])
    
    def __iter__(self):
        """Make cursor iterable"""
        return iter(self._data)
    
    def __next__(self):
        """Support next() function"""
        return next(iter(self._data))
    
    def __list__(self):
        return self._data

class MockCollection:
    def __init__(self, name="default"):
        self.name = name
        self.filename = f"mock_db_{name}.json"
        self._data = self._load_data()
        
    def _load_data(self):
        if os.path.exists(self.filename):
            try:
                with open(self.filename, 'r') as f:
                    data = json.load(f)
                    # Convert datetime strings back to datetime objects
                    for item in data:
                        for key, val in item.items():
                            if isinstance(val, str) and val.endswith("+00:00") and "T" in val:
                                try:
                                    item[key] = datetime.fromisoformat(val)
                                except:
                                    pass
                    print(f"📂 Loaded {len(data)} documents from {self.filename}")
                    return data
            except Exception as e:
                print(f"⚠️ Failed to load {self.filename}: {e}")
                return []
        return []

    def _save_data(self):
        try:
            # Convert datetime objects to strings for JSON serialization
            data_to_save = []
            for item in self._data:
                item_copy = dict(item)
                for key, val in item_copy.items():
                    if isinstance(val, datetime):
                        item_copy[key] = val.isoformat()
                data_to_save.append(item_copy)
            
            with open(self.filename, 'w') as f:
                json.dump(data_to_save, f, indent=2)
            # print(f"💾 Saved {len(data_to_save)} documents to {self.filename}")
        except Exception as e:
            print(f"❌ Failed to save {self.filename}: {e}")

    def find_one(self, query):
        # print(f"🔍 MockCollection({self.name}).find_one called with query: {query}")
        
        if not query:
            return self._data[0] if self._data else None
            
        # Handle email-based queries (for login)
        if query.get("email"):
            for user in self._data:
                if query.get("email") == user.get("email"):
                    return user
                    
        # Handle _id-based queries
        if query.get("_id"):
            search_id = str(query.get("_id"))
            for doc in self._data:
                if str(doc.get("_id")) == search_id:
                    return doc
        
        # Handle studentId queries
        if query.get("studentId"):
            for doc in self._data:
                if doc.get("studentId") == query.get("studentId"):
                    return doc
        
        # Generic query matching
        for doc in self._data:
            match = True
            for key, value in query.items():
                # Handle ObjectId comparison
                if key == "_id":
                    if str(doc.get(key)) != str(value):
                        match = False
                        break
                elif doc.get(key) != value:
                    match = False
                    break
            if match:
                return doc
                    
        return None
        
    def insert_one(self, doc):
        # print(f"� MockCollection({self.name}).insert_one called")
        
        # Check uniqueness for specific collections
        if self.name == "users" and "email" in doc:
            if self.find_one({"email": doc["email"]}):
                raise Exception("Duplicate email")
        
        # Create a copy to avoid reference issues
        new_doc = dict(doc)
        if "_id" not in new_doc:
            new_doc["_id"] = str(ObjectId())
            
        self._data.append(new_doc)
        self._save_data()  # ✅ Save after insert
        
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
                    # Handle ObjectId comparison
                    if key == "_id":
                        if str(doc.get(key)) != str(value):
                            match = False
                            break
                    elif doc.get(key) != value:
                        match = False
                        break
                if match:
                    filtered_data.append(doc)
        
        return MockCursor(filtered_data)

    def count_documents(self, query=None):
        if query is None:
            return len(self._data)
        return len(list(self.find(query)))

    def estimated_document_count(self):
        return len(self._data)

    def create_index(self, *args, **kwargs):
        pass

    def find_one_and_update(self, filter_query, update_query, **kwargs):
        doc = self.find_one(filter_query)
        if doc:
            # Apply updates
            if "$set" in update_query:
                for k, v in update_query["$set"].items():
                    # handle dotted paths
                    current = doc
                    parts = k.split(".")
                    for p in parts[:-1]:
                        if p not in current or not isinstance(current[p], dict):
                            current[p] = {}
                        current = current[p]
                    current[parts[-1]] = v
            
            self._save_data()  # ✅ Save after update
            return doc
        
        # Handle upsert
        if kwargs.get("upsert"):
            new_doc = dict(filter_query)
            if "$set" in update_query:
                for k, v in update_query["$set"].items():
                    # Handle nested keys for upsert
                    if '.' in k:
                        parts = k.split('.')
                        current = new_doc
                        for p in parts[:-1]:
                            if p not in current:
                                current[p] = {}
                            current = current[p]
                        current[parts[-1]] = v
                    else:
                        new_doc[k] = v
            
            # Add defaults if missing
            if "_id" not in new_doc:
                new_doc["_id"] = str(ObjectId())
                
            self.insert_one(new_doc)
            return new_doc
            
        return None

    def update_one(self, filter_query, update_data, upsert=False):
        doc = self.find_one(filter_query)
        if doc:
            # Apply $set operations
            if '$set' in update_data:
                for key, value in update_data['$set'].items():
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
            
            # Apply $inc operations
            if '$inc' in update_data:
                for key, value in update_data['$inc'].items():
                    doc[key] = doc.get(key, 0) + value
            
            # Apply $push operations
            if '$push' in update_data:
                for key, value in update_data['$push'].items():
                    if key not in doc:
                        doc[key] = []
                    doc[key].append(value)
            
            self._save_data()  # ✅ Save after update
            return {"matched_count": 1, "modified_count": 1}
            
        if upsert:
            new_doc = dict(filter_query)
            if '$set' in update_data:
                new_doc.update(update_data['$set'])
            self.insert_one(new_doc)
            return {"matched_count": 0, "modified_count": 0, "upserted_id": "new"}
            
        return {"matched_count": 0, "modified_count": 0}

    def aggregate(self, pipeline):
        """Simple mock aggregation support"""
        # Only supports basic $match and $group for now
        result = self._data
        
        for stage in pipeline:
            if "$match" in stage:
                query = stage["$match"]
                result = [doc for doc in result if all(doc.get(k) == v for k, v in query.items())]
            elif "$group" in stage:
                # Very basic grouping - only supports averaging
                group = stage["$group"]
                if "_id" in group and group["_id"] is None:
                    # Global aggregation
                    for field, expr in group.items():
                        if field == "_id": continue
                        if "$avg" in expr:
                            target_field = expr["$avg"].replace("$", "")
                            values = [doc.get(target_field, 0) for doc in result if isinstance(doc.get(target_field), (int, float))]
                            avg = sum(values) / len(values) if values else 0
                            return [{"_id": None, field: avg}]
                            
        return result

if use_mock_db:
    # Mock collections with persistence
    users_col = MockCollection("users")
    courses_col = MockCollection("courses")
    quizzes_col = MockCollection("quizzes")
    attempts_col = MockCollection("attempts")
    events_col = MockCollection("events")
    profiles_col = MockCollection("profiles")
    templates_col = MockCollection("templates")

    def ensure_indexes():
        print("📝 Mock database - indexes skipped (using persistent JSON files)")
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
            profiles_col.create_index("studentId", unique=True)
            templates_col.create_index("user_id")
            
            # Additional useful indexes
            quizzes_col.create_index("user_id")
            attempts_col.create_index("user_id")
            courses_col.create_index("instructor_id")
            
            print("📋 Database indexes created successfully")
        except Exception as e:
            print(f"⚠️ Index creation failed: {e}")
