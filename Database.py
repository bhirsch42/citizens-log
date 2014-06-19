from Handler import *
from google.appengine.ext import ndb
from google.appengine.api import memcache
import hashlib
import random
from string import letters
import time
import datetime

users_key = "users"

class PageOfInterest(ndb.Model):
	username = ndb.StringProperty(required=True)
	pagename = ndb.StringProperty(required=True)

class Entry(ndb.Model):
	title = ndb.StringProperty(required=True)
	content = ndb.TextProperty(required=True)
	datetime_created = ndb.DateTimeProperty(required=True, auto_now_add=False)
	datetime_modified = ndb.DateTimeProperty(required=True, auto_now_add=False)

class Page(ndb.Model):
	name = ndb.StringProperty(required=True)
	entries = ndb.StructuredProperty(Entry, repeated=True)
	datetime_created = ndb.DateTimeProperty(required=True, auto_now_add=False)
	datetime_modified = ndb.DateTimeProperty(auto_now_add=True)
	poi_num = ndb.IntegerProperty()

class MyUser(ndb.Model):
	username = ndb.StringProperty(required=True)
	password_hash = ndb.StringProperty(required=True)
	email = ndb.StringProperty(required=False)
	datetime_created = ndb.DateTimeProperty(required=True, auto_now_add=False)
	datetime_modified = ndb.DateTimeProperty(auto_now_add=True)
	pages = ndb.KeyProperty(repeated=True)
	private_log = ndb.StructuredProperty(Page, required=True)
	pages_of_interest = ndb.StructuredProperty(PageOfInterest, repeated=True)



def make_salt(length = 5):
	return ''.join(random.choice(letters) for x in xrange(length))

def make_password_hash(name, pw, salt = None):
	if not salt:
		salt = make_salt()
	h = hashlib.sha256(name + pw + salt).hexdigest()
	return '%s,%s' % (salt, h)

def valid_password(username, password):
	user = get_user(username)
	if not user:
		return False
	h = user.password_hash
	salt = h.split(',')[0]
	return h == make_password_hash(username, password, salt)

def add_user(username, password, email):
	# check if user exists
	if (username in get_all_users()):
		return false

	password_hash = make_password_hash(username, password)

	now = datetime.datetime.now()
	private_log = Page(name="Private Log", datetime_created=now)

	# add user to datastore
	my_user = MyUser(username=username, password_hash=password_hash, email=email, datetime_created=now, private_log=private_log)
	my_user.put()

	# update memcache
	my_users = memcache.get(users_key)
	add_user_to_dict(my_user, my_users)
	memcache.set(users_key, my_users)

	return True

def add_private_entry(user, content):
	now = datetime.datetime.now()
	title = time.strftime("%m/%d/%y %H:%M", time.localtime())
	entry = Entry(title = title, content = content, datetime_created = now, datetime_modified = now)
	if not user.private_log.entries:
		user.private_log.entries = [entry]
	else:
		user.private_log.entries.append(entry)
	user.put()
	update_user_memcache(user=user)

def replace_entry_content(user, markdown, entry_index):
	if (len(user.entries) <= entry_index):
		return
	user.entries[entry_index].content = markdown
	user.put()
	update_user_memcache(user=user)

def get_all_users(update=False):
	my_users = memcache.get(users_key)

	# update
	if my_users is None or update:
		update_user_memcache()
		my_users = memcache.get(users_key)

	return my_users


def update_user_memcache(user = None):
	if user:
		user_dict = memcache.get(users_key)
		add_user_to_dict(user, user_dict)
		memcache.set(users_key, user_dict)
		return

	registered_users = ndb.gql("SELECT * FROM MyUser")
	my_user_dict = {}
	for registered_user in registered_users:
		add_user_to_dict(registered_user, my_user_dict)
	memcache.set(users_key, my_user_dict)


def add_user_to_dict(my_user, d):
	d[my_user.username] = my_user


def is_registered_user(user, update=False):
	if not user:
		return False

	# check if user exists
	user_exists = user.username() in get_all_users()
	return user_exists


def get_user(username):
	if not username in get_all_users():
		return None
	return get_all_users()[username]
