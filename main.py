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
import logging
import json

class MainHandler(Handler):
	def get(self):
		user = self.get_user()
		self.render_home()

	def post(self):
		form_type = self.request.get("form-type")
		logging.error("Form type: " + form_type)
		if (form_type == 'login'):
			self.login_post()
		elif (form_type == 'entry'):
			self.entry_post()
		self.render_home()

	def login_post(self):
		username = self.request.get('username')
		password = self.request.get('password')
		if (Database.valid_password(username, password)):
			self.login(Database.get_user(username))

	def entry_post(self):
		logging.info("Entry_post called")
		markdown = self.request.get('markdown')
		Database.add_entry(self.get_user(), markdown)

# class LoginHandler(Handler):
# 	def get(self):
# 		self.render_home()

# 	def post(self):
# 		self.write("LoginHandler")

# class RegisterHandler(Handler):
# 	def get(self):
# 		self.render_home()
# 	def post(self):
# 		username_is_taken = False
# 		passwords_dont_match = False
# 		username_is_invalid = False

# 		username = self.request.get('reg-username')
# 		logging.info("Username: " + username)
# 		password = self.request.get('reg-password')
# 		password_repeat = self.request.get('password-repeat')
# 		email = self.request.get('email')
# 		page_name = self.request.get('page-name')

# 		if username in Database.get_all_users():
# 			username_is_taken = True
# 		if password != password_repeat:
# 			passwords_dont_match = True
# 		if re.match("^[a-zA-Z0-9_-]{3,20}$", username) is None:
# 			username_is_invalid = True
# 			logging.info("Invalid username: " + username)
# 		if username_is_taken or passwords_dont_match or username_is_invalid:
# 			logging.info("Invalid registration attempted.")
# 			self.render_home(passwords_dont_match=passwords_dont_match, username_is_taken=username_is_taken, username_is_invalid=username_is_invalid)
# 			return

# 		Database.add_user(page_name, username, password, email)
# 		self.redirect('/entry-accountcreated')


class GetUserHandler(Handler):
	def get(self):
		logging.info("Ajax requested user.")
		query_list = self.request.query_string.split('=')
		user = None
		if len(query_list) < 2:
			user = self.get_user()
		else:
			username = query_list[1]
			user = Database.get_user(username)
		logging.info(user)
		obj = json.dumps({"username":user.username, "entries":user.entries, "pageName":user.page_name})
		self.response.write(obj)

app = webapp2.WSGIApplication([
	('/', MainHandler),
	('/control/getuser', GetUserHandler),
], debug=True)
