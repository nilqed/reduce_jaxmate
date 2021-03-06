**NOTE**: this is a hack (just to produce MathJax formulae), **not intended** for production! There are several excellent frontends for [REDUCE](https://reduce-algebra.sourceforge.io/), e.g.
[RUN-REDUCE](https://fjwright.github.io/Run-REDUCE/) or [TeXmacs](https://texmacs.org/tmweb/home/welcome.en.html) among others.

# reduce_jaxmate
REDUCE in browser (scratchpad, MathJax) (:warning: :construction:)

![red_jxmt1](docs/test.png)

#### Important
On Linux change `redcsl.bat` to `redcsl` in `reduce_server.js`:

```
> reduce_server.js:const repl = spawn('redcsl', ['--nogui']);
```

## NOTES

##### Style
The style can be configured at the beginning of `reduce_client.html`.

```
<style>
html, body {
background-color: #E0E0E0;
color: black;
font-family: monospace;
margin:  0;
padding: 0;
margin-bottom: 25px;
...
```



##### Read a file without noise 
Paths are relative to `HOME`. Notice the `$` at the end.

```
> @mathjax off
> in "../Desktop/test.red"$
> @mathjax on

```

If `@text` is `on`, then this should/can be set `off` as well, of course.
In case you only have `$`-endings, it is usually not necessary to turn
LaTeX output off. 

##### Write LaTeX (pretty print -- pp)
Define a procedure:

```
procedure pp(s); lisp(princ(s));
```

Then `pp "$\int f(x)\, dx $" $  ==>  `

One may mix HTML and LaTeX as well:

```
> pp "<h1>Hello $\LaTeX$</h1>" $
```

### %save/%load *.json

![red_jxmt1](docs/redsession.png)


