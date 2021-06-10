const $ = s => document.querySelector(s)
const $$ = s => document.querySelectorAll(s)

const isMain = str => (/^#{1,2}(?!#)/).test(str)
const isSub = str => (/^#{3}(?!#)/).test(str)

function convert(raw) {
  let arr = raw.split(/\n(?=\s*#{1,3}[^#])/).filter(s => s!="").map(s => s.trim())

  let html = ''
  for(let i=0; i<arr.length; i++) {

    if(arr[i+1] !== undefined) {
      if(isMain(arr[i]) && isMain(arr[i+1])) {
        html += `
<section data-markdown>
<textarea data-template>
${arr[i].replace(/^#+(?!#)/,'').trim()}
</textarea>
</section>
`
      } else if(isMain(arr[i]) && isSub(arr[i+1])) {
        html += `
<section>
<section data-markdown>
<textarea data-template>
${arr[i].replace(/^#+(?!#)/,'').trim()}
</textarea>
</section>
`
      } else if(isSub(arr[i]) && isSub(arr[i+1])) {
        html += `
<section data-markdown>
<textarea data-template>
${arr[i].replace(/^#+(?!#)/,'').trim()}
</textarea>
</section>
`
      } else if(isSub(arr[i]) && isMain(arr[i+1])) {
        html += `
<section data-markdown>
<textarea data-template>
${arr[i].replace(/^#+(?!#)/,'').trim() }
</textarea>
</section>
</section>
`
      }      

    } else {
      if(isMain(arr[i])) {
        html += `
<section data-markdown>
<textarea data-template>
${arr[i].replace(/^#+(?!#)/,'').trim()}
</textarea>
</section>
`        
      } else if(isSub(arr[i])) {
        html += `
<section data-markdown>
<textarea data-template>
${arr[i].replace(/^#+(?!#)/,'').trim()}
</textarea>
</section>
</section>
`        
      }
    }

  }

  return html
}




const Editor = {
  init() {
    console.log('editor init')
    this.$editInput = $('.editor textarea')
    this.$saveBtn = $('.editor .button-save')
    this.markdown = localStorage.markdown || `#oneslide
    ##1
    ##2
    ##3
    ###4
    ###5`
    this.$slideContainer = $('.slides')

    this.bind()
    this.start()
  },

  bind() {
    let self = this
    console.log(self.$editInput.value)
    this.$saveBtn.onclick = function() {
      localStorage.markdown = self.$editInput.value
      location.reload()
    }
    self.$editInput.value = localStorage.markdown

  },

  start() {
  this.$slideContainer.innerHTML = convert(this.markdown)
	Reveal.initialize({
				controls: true,
				progress: true,
				center: localStorage.align === 'left-top' ? false : true,
				hash: true,

				transition: localStorage.transition || 'slide',

				// More info https://github.com/hakimel/reveal.js#dependencies
				dependencies: [
					{ src: 'plugin/markdown/marked.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
					{ src: 'plugin/markdown/markdown.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
					{ src: 'plugin/highlight/highlight.js' },
					{ src: 'plugin/search/search.js', async: true },
					{ src: 'plugin/zoom-js/zoom.js', async: true },
					{ src: 'plugin/notes/notes.js', async: true }
				]
			});	
  }

}

const Menu = {
  init() {
    console.log('menu init')
    this.$settingIcon = $('.control .icon-setting')
    this.$menu = $('.menu')
    this.$closeIcon = $('.menu .icon-close')
    this.$$tabs = $$('.menu .tab')
    this.$$contents = $$('.menu .content')

    this.bind()
  },

  bind() {
    let self = this
    this.$settingIcon.onclick = function() {
      self.$menu.classList.add('open')
    }

    this.$closeIcon.onclick = function() {
      self.$menu.classList.remove('open')
    }

    this.$$tabs.forEach($tab => $tab.onclick = function() {
      self.$$tabs.forEach($tab => $tab.classList.remove('active'))
      this.classList.add('active')
      self.$$contents.forEach($content => $content.classList.remove('active'))
      let i = [...self.$$tabs].indexOf(this)
      self.$$contents[i].classList.add('active')
    })
  }
}

const Theme = {
  init() {
    this.$$figures = $$('.theme figure')
    this.$transition = $('.theme .transition')
    this.$align = $('.theme .align')
    this.$reveal = $('.reveal')

    this.bind()
    this.loadTheme()

  },

  bind() {
    this.$$figures.forEach($figure => $figure.onclick = () => {
      this.$$figures.forEach($figure => $figure.classList.remove('select'))
      $figure.classList.add('select')
      this.setTheme($figure.dataset.theme)
    })

    this.$transition.onchange = function() {
      localStorage.transition = this.value
      location.reload()
    }

    this.$align.onchange = function() {
      localStorage.align = this.value
      location.reload()
    }
  },

  setTheme(theme) {
    localStorage.theme = theme
    location.reload()
  },

  loadTheme() {
    let theme = localStorage.theme || 'beige'
    let $link = document.createElement('link')
    $link.rel = 'stylesheet'
    $link.href = `css/theme/${theme}.css`
    document.head.appendChild($link)

    $(`.theme figure[data-theme=${theme}`).classList.add('select')
    this.$transition.value = localStorage.transition || 'slide'
    this.$align.value = localStorage.align || 'center'
    this.$reveal.classList.add(this.$align.value)
  }
}

const Print = {
  init() {
    this.$download = $('.download')

    
    this.bind()
    this.start()



  },

  bind() {
    this.$download.addEventListener('click', () => {
      let $link = document.createElement('a')
      $link.setAttribute('target', '_blank')
      $link.setAttribute('href', location.href.replace(/#\//, '?print-pdf'))
      $link.click()
    })

    
  },


  start() {
    var link = document.createElement( 'link' );
    link.rel = 'stylesheet';
    link.type = 'text/css';
    if(window.location.search.match( /print-pdf/gi )) {
      link.href = 'css/print/pdf.css'
      window.print()
    }else {
      link.href = 'css/print/paper.css'
    }    
    
    document.getElementsByTagName( 'head' )[0].appendChild( link )
  }

}




const App = {
  init() {
    [...arguments].forEach(Module => Module.init())
  }
}

App.init(Menu, Editor, Theme, Print) 








