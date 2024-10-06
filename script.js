const $ = (p,...args) => {
  if (p.constructor === String) {
    p = document.getElementById(p);
  }
  for (let x of args) {
    if (x.constructor === String) {
      p = p.appendChild(document.createElement(x));
    } else if (x.constructor === Array) {
      for (let c of x)
        p.classList.add(c);
    } else if (x.constructor === Object) {
      for (const [key,val] of Object.entries(x)) {
        if (key==='style') {
          for (const [k,v] of Object.entries(val)) {
            if (v!==null) p.style[k] = v;
            else p.style.removeProperty(k);
          }
        } else if (key==='events') {
          for (const [k,v] of Object.entries(val)) {
            if (v!==null) p.addEventListener(k,v);
            else p.removeEventListener(k);
          }
        } else {
          if (val!==null) p.setAttribute(key,val);
          else p.removeAttribute(key);
        }
      }
    }
  }
  return p;
};

const parseInput = s => {
  let mm = 0;
  while (true) {
    s = s.trimStart()
    if (!s) break;

    const m = s.match(/^([0-9.eE]+)(?:\s*\/\s*([0-9.eE]+))?\s*([a-z'"′″]+)/);
    if (!m) return NaN;

    let v = +m[1];
    if (m[2] !== undefined) v /= +m[2];
    if (v.isNaN) return NaN;

    switch (m[3]) {
      case 'mm':
        mm += v;
        break;
      case 'cm':
        mm += v * 1e1;
        break;
      case 'dm':
        mm += v * 1e2;
        break;
      case 'm':
        mm += v * 1e3;
        break;
      case 'km':
        mm += v * 1e6;
        break;
      case 'in':
      case '\"':
      case '\'\'':
      case '″':
      case '′′':
        mm += v * 25.4;
        break;
      case 'ft':
      case '\'':
      case '′':
        mm += v * 304.8;
        break;
      default:
        return NaN; // TODO: is this incorrect
    }

    s = s.substring(m[0].length);
  }
  return mm;
};

const last = xs => xs[xs.length - 1];

const round = (x,n) => x.toFixed(n).replace(/\.?0+$/,'');

document.addEventListener('DOMContentLoaded', () => {
  const input = $(document.body, 'input', { type: 'text' });
  const div = $(document.body, 'div', ['noto']);

  input.focus();
  $(input, { events: {
    input: e => {
      const mm = parseInput(e.target.value);
      if (isNaN(mm)) return; // TODO: mm.isNaN
                             // TODO: make box red if bad input

      // console.log(mm);
      // console.log(mm.isNaN);
      div.innerHTML = '';
      $(div, 'p').textContent = `${round(mm,3)} mm`;

      const ft = mm / 304.8;
      $(div, 'p').textContent = `${round(ft,3)} ft`;

      const inches = mm / 25.4;
      $(div, 'p').textContent = `${round(inches,4)} in`;

      const units = [ '′', '″', '/2', '/4', '/8', '/16' ];
      const fracs = [ 1, 12, 2, 2, 2, 2 ];
      const split = [ ];
      let r = ft;
      for (let i = 0;;) {
        r *= fracs[i];
        if (++i == fracs.length) break;
        const n = Math.trunc(r);
        split.push(n);
        r -= n;
      }
      split.push(round(r, 2));

      for (let i = fracs.length; --i; ) {
        if (split[i] == fracs[i]) {
          split[i] = 0;
          ++split[i-1];
        } else break;
      }

      const ft_in_fracs = () => {
        let str = '';
        for (const i in split) {
          const x = split[i];
          if (x != 0) str += `${x}${units[i]} `;
        }
        return str.trim();
      }
      const str1 = ft_in_fracs();
      $(div, 'p').textContent = str1;

      split[4] += (split[2]*2 + split[3])*2;
      split[3] = 0;
      split[2] = 0;
      if (split[5] > 1) {
        ++split[4];
        split[5] = `− ${round(2 - split[5], 2)}`;
      }

      for (let i = 4; i; --i) {
        if (split[i] % fracs[i] === 0) {
          split[i-1] += split[i] / fracs[i];
          split[i] = 0;
        } else break;
      }

      const str2 = ft_in_fracs();
      if (str2 != str1) {
        $(div, 'p').textContent = str2;
      }
    }
  }});
});
