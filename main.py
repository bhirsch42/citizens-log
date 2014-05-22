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

class MainHandler(Handler):
	def get(self):
		self.render('home.html', user=self.get_user())

class LoginHandler(Handler):
	def get(self):
		# Login to Google
		user = self.get_google_user()
		if not user:
			self.redirect(users.create_login_url('/login'))
			return

		if not Database.is_registered_user(user):
			self.render('login_user_doesnt_exist.html', user=self.get_user())
			return

		self.redirect('/')


class CreateAccountHandler(Handler):
	def get(self):
		if Database.is_registered_user(self.get_google_user()):
			self.render('user_already_exists.html', user=self.get_user())
		else:
			self.render('create_user.html', user=self.get_user())

	def post(self):
		first_name = self.request.get('first_name')
		last_name = self.request.get('last_name')
		user = self.get_google_user();
		if not user:
			self.redirect('/login')
		elif first_name == '' or last_name == '':
			self.render('create_user.html', user=self.get_user(), error=True)
		else:
			Database.add_user(user.user_id(), first_name, last_name)
			self.render('user_created.html', user=self.get_user())

class LogoutHandler(Handler):
	def get(self):
		user = self.get_google_user()
		if not user:
			self.redirect('/')
		self.redirect(users.create_logout_url('/'))

class MyAccountHandler(Handler):
	def get(self):
		user = self.get_user()
		if not user:
			self.redirect('/login')
			return
		self.render('my_account.html', page='overview', user=user)

class AdminHandler(Handler):
	def get(self):
		user = self.get_user()
		if user and user.is_a_moderator:
			self.render('moderator.html', user=user)
			return
		self.render('permission_denied.html', user=user)

class MyBioHandler(Handler):
	def get(self):
		user = self.get_user()
		if user and user.has_a_bio:
			self.render('my_bio.html', page='bio', user=user, image_url_is_valid=True, description_is_valid=True, submission_successful=False)
			return
		self.render('permission_denied.html', user=user)

	def post(self):
		user = self.get_user()
		if user and user.has_a_bio:
			image_url_is_valid = True
			description_is_valid = True

			description = self.request.get('description')
			image_url = self.request.get('image_url')

			# check if image is valid
			maintype= mimetypes.guess_type(urlparse.urlparse(image_url).path)[0]
			if maintype not in ('image/png', 'image/jpeg', 'image/gif'):
				image_url_is_valid = False

			# check if description is valid
			description_is_valid = description != ''

			if image_url_is_valid and description_is_valid:
				bio = Database.Bio(description=description, image_url=image_url)
				user.bio = bio
				user.put()
				Database.update_user_memcache()
				self.render('my_bio.html', page='bio', user=user, image_url_is_valid=image_url_is_valid,
					description_is_valid=description_is_valid, submission_successful=True)
			else:
				self.render('my_bio.html', page='bio', user=user, image_url_is_valid=image_url_is_valid,
					description_is_valid=description_is_valid, submission_successful=False,
					new_image_url=image_url)			

		else:
			self.render('permission_denied.html', user=user)

class CalendarHandler(Handler):
	def get(self):
		self.render('calendar.html', user=self.get_user())

class ContactHandler(Handler):
	def get(self):
		self.render('contact.html', user=self.get_user(), users=Database.get_all_users())

class ModeratorHandler(Handler):
	def get(self):
		self.render('moderator.html', page='moderator', user=self.get_user(), users=Database.get_all_users())
		users = Database.get_all_users()
		logging.error(users)

	def post(self):
		selected_user_key = self.request.get('selected_user_key')
		selected_user = Database.get_all_users()[selected_user_key]
		if not self.request.POST.get('update_user', None):
			self.render('moderator.html', page='moderator', user=self.get_user(), users=Database.get_all_users(),
				selected_user=selected_user, selected_user_key=selected_user_key)
		else:
			is_a_moderator = bool(self.request.get("is_a_moderator", default_value=''))
			has_a_bio = bool(self.request.get("has_a_bio", default_value=''))
			can_create_news_posts = bool(self.request.get("can_create_news_posts", default_value=''))
			can_edit_calendar = bool(self.request.get("can_edit_calendar", default_value=''))

			selected_user.is_a_moderator = is_a_moderator
			selected_user.has_a_bio = has_a_bio
			selected_user.can_create_news_posts = can_create_news_posts
			selected_user.can_edit_calendar = can_edit_calendar
			selected_user.put()
			Database.update_user_memcache()
			self.render('moderator.html', page='moderator', user=self.get_user(), users=Database.get_all_users(),
				selected_user=selected_user, selected_user_key=selected_user_key, submission_successful="True")

class BioHandler(Handler):
	def get(self):
		self.render('bios.html', user=self.get_user(), users=Database.get_all_users())

app = webapp2.WSGIApplication([
	('/', MainHandler),
	('/login', LoginHandler),
	('/login/createaccount', CreateAccountHandler),
	('/logout', LogoutHandler),
	('/myaccount', MyAccountHandler),
	('/admin', AdminHandler),
], debug=True)
