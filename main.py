#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the 'License');
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an 'AS IS' BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import webapp2
from Handler import *
import Database
import urlparse
import mimetypes
import re
import json
import logging

class MainHandler(Handler):
	def get(self):
		user = self.get_user()
		self.render_home()

	def post(self):
		form_type = self.request.get("form-type")
		if (form_type == 'login'):
			self.login_post()
		elif (form_type == 'entry'):
			self.entry_post()
		elif (form_type == 'register'):
			self.register_post()
		elif (form_type == 'edit'):
			self.edit_post()

	def entry_post(self):
		if not self.read_secure_cookie('user_id'):
			s = str('#!login')
			self.redirect(s)
			return
		content = self.request.get('content')
		Database.add_entry(self.get_user(), content)
		s = str('#!user/' + self.get_user().username)
		self.redirect(s)

	def edit_post(self):
		if not self.read_secure_cookie('user_id'):
			s = str('#!login')
			self.redirect(s)
			return
		content = self.request.get('content')
		entry_id = self.request.get('entry-id')
		entry_index = int(entry_id.split('-')[1])
		Database.replace_entry_content(self.get_user(), content, entry_index)
		s = str('#!user/' + self.get_user().username)
		self.redirect(s)		

	def register_post(self):
		username_is_taken = False
		passwords_dont_match = False
		username_is_invalid = False

		username = self.request.get('username')
		password = self.request.get('password')
		password_repeat = self.request.get('password-repeat')
		email = self.request.get('email')
		page_name = self.request.get('page-name')

		if username in Database.get_all_users():
			username_is_taken = True
		if password != password_repeat:
			passwords_dont_match = True
		if re.match("^[a-zA-Z0-9_-]{3,20}$", username) is None:
			username_is_invalid = True
		if username_is_taken or passwords_dont_match or username_is_invalid:
			self.render_home(passwords_dont_match=passwords_dont_match, username_is_taken=username_is_taken, username_is_invalid=username_is_invalid)
			return
		Database.add_user(page_name, username, password, email)
		self.login(Database.get_user(username))
		s = str('#!user/' + username)
		self.redirect(s)

class GetUserHandler(Handler):
	def get(self):
		query_list = self.request.query_string.split('=')
		user = None
		if len(query_list) < 2:
			user = self.get_user()
		else:
			username = query_list[1]
			user = Database.get_user(username)
		if not user:
			return
		# TODO
		obj = json.dumps({"username":user.username})
		self.response.out.write(str(obj))

class GetAllUsersHandler(Handler):
	def get(self):
		users = []
		for username in Database.get_all_users():
			user = Database.get_user(username)
			users.append({"username": user.username, "pageName": user.page_name})
		obj = json.dumps(users)
		self.response.write(str(obj))

class EntryEditorHandler(Handler):
	def get(self):
		self.render("entry_editor.html", users=[Database.get_user(u) for u in Database.get_all_users()])
	def post(self):
		username = self.request.get('username')
		content = self.request.get('content')
		entry_id = self.request.get('entry-id')
		entry_index = int(entry_id)
		Database.replace_entry_content(Database.get_user(username), content, entry_index)
		self.redirect('/entryeditor')

class PanelsHTMLHandler(Handler):
	def get(self):
		self.render('panels.html')

class TinyFormHTMLHandler(Handler):
	def get(self):
		self.render('tinyform.html')

class LoginHandler(Handler):
	def get(self):
		pass
	def post(self):
		username = self.request.get('username')
		password = self.request.get('password')
		logging.info(username + ", " + password)
		if (Database.valid_password(username, password)):
			self.login(Database.get_user(username))
			self.response.out.write("Success")
		else:
			self.response.out.write("Failure")

class RegisterHandler(Handler):
	def get(self):
		pass
	def post(self):
		username_is_taken = False
		passwords_dont_match = False
		username_is_invalid = False

		username = self.request.get('username')
		password = self.request.get('password')
		password_repeat = self.request.get('password-repeat')
		email = self.request.get('email')

		username_is_taken = username in Database.get_all_users()
		passwords_dont_match = password != password_repeat
		username_is_invalid = re.match("^[a-zA-Z0-9_-]{3,20}$", username) is None
		if username_is_taken or passwords_dont_match or username_is_invalid:
			s = "Failure"
			if username_is_taken:
				s += " username_is_taken"
			if passwords_dont_match:
				s += " passwords_dont_match"
			if username_is_invalid:
				s += ' username_is_invalid'
			self.response.out.write(s)
		else:
			Database.add_user(username, password, email)
			self.login(Database.get_user(username))
			self.response.out.write("Success")

class SubmitPrivateEntryHandler(Handler):
	def get(self):
		pass
	def post(self):
		content = self.request.get('content')
		logging.info(content)
		if not self.read_secure_cookie('user_id'):
			self.redirect('#!login')
		Database.add_private_entry(self.get_user(), content)

class GetPrivateEntriesHandler(Handler):
	def get(self):
		if not self.read_secure_cookie('user_id'):
			self.redirect('#!login')
		titles = []
		contents = []
		for entry in self.get_user().private_log.entries:
			titles.append(entry.title)
			contents.append(entry.content)
		obj = json.dumps({"titles":titles, "contents":contents})
		self.response.out.write(obj)

class ValidateCookieHandler(Handler):
	def get(self):
		self.response.out.write(self.read_secure_cookie('user_id'))

app = webapp2.WSGIApplication([
	('/', MainHandler),
	('/control/getuser', GetUserHandler),
	('/control/getallusers', GetAllUsersHandler),
	('/control/login', LoginHandler),
	('/control/register', RegisterHandler),
	('/static/panelsHTML', PanelsHTMLHandler),
	('/static/tinyFormHTML', TinyFormHTMLHandler),
	('/control/submitprivateentry', SubmitPrivateEntryHandler),
	('/control/getprivatelogs', GetPrivateEntriesHandler),
	('/control/validatecooke', ValidateCookieHandler)
	# ('/entryeditor', EntryEditorHandler)
], debug=True)
