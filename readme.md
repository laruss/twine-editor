# TWINE EDITOR 0.1
Twine editor - is editor to [Twine](https://twinery.org/) format stories, implemented as Node.js server + frontend in jQuery. Created for better experiance in editing Twine stories.
# Installation
1. Download project from GIT repository.
2. Unpack project to any folder you like.
3. NPM install to install dependencies
```bash
npm install
```
4. Run editor as:
```bash
npm run editor
```
Editor will start at http://localhost:3000
# Usage
Choose your **<<project_name>>.html** file destination and load it. App will load all passages and will display them to you. Additionally App will create a **<<project_name>>** folder at the same folder. There will be located your **JS** and **CSS** files, which you can edit in your favorite Editor.
Then you can edit passages or code in files. When you're done, you can check your work manually or by launching it via interface. It will compile your project and run it in new window.
# Notes (ver. 0.1)
Editor is supporting only [SugarCube](https://www.motoslave.net/sugarcube/2/).
There is no TAGS for now.
There are some bugs in Editor textfield, which will be removed in the next versions. If you find any one with steps of reproduce, you can mail me at konstantinchist@yandex.ru.
There is no "launch passage" button for now.
You cannot start a new Project via Editor.
# Credits
- jquery-3.5.1.min.js
- [jquery.caret.js](https://github.com/acdvorak/jquery.caret) 
- [jquery.modal.min.js](https://github.com/kylefox/jquery-modal)
- [localStorageDB.js](https://github.com/DVLP/localStorageDB)