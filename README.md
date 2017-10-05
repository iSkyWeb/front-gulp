Project-blank for front works. If you want to change something - do it in the develop branch. When you finish - create merge request to master. <br/>

Project tree: <br/>
- **dist** - files for test/prod. Everything generates here automatically from src folder. <br/>
- **eslint-config** - rules for js lint <br/>
- **src** - files for development <br/>
--- img - for images <br/>
--- js - for js files <br/>
------ partial - for vendor plugins/libraries, that shouldn't be included in the main bundle <br/>
--- sass - for sass files <br/> 
------ layout - for layout and common styles <br/> 
------ modules - for module files like 'profile', 'blog', etc. <br/> 
------ vendor - for vendor styles <br/> 
--- views - for views layout. Could be in some kind of preprocessor like haml, pug, etc or just in .html with module structure. <br/>
- **.eslintrc** - js lint config  <br/> 
- **.htmllintrc** - html lint config  <br/> 
- **.sass-lint.yml** - sass lint config <br/> 
- **gulpfile.js** - gulp config <br/> 
- **package.json** - npm packages <br/> 
- **sprite_template.css.handlebars** - template for .jpg and .png icons sprite <br/> 

Console commands: <br/>
**npm i**  - install packages from packet.json (You should have npm version >=5) <br/>
**gulp** - for dev build <br/>
**gulp watch** - for working with dev files <br/>
**gulp-prod** -  for prod version of files (removes comments, todos, sourcemap and minify) <br/>