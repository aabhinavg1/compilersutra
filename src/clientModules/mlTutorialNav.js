import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

let stop = () => {};

function lessonId(link) {
  const href = link.getAttribute('href') || '';
  const hash = href.split('#')[1];
  return hash || '';
}

function watchChapter() {
  stop();
  const chapter = document.querySelector('.ml-tutorial-chapter');
  if (!chapter) {
    return;
  }
  const links = [...chapter.querySelectorAll('.ml-tutorial-lesson > a.menu__link')];
  const headings = links
    .map((link) => {
      const id = lessonId(link);
      return id ? {id, link, heading: document.getElementById(id)} : null;
    })
    .filter((item) => item && item.heading);

  const mark = (id) => {
    links.forEach((link) => {
      const on = lessonId(link) === id;
      link.classList.toggle('ml-tutorial-current', on);
      if (on) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  const fromScroll = () => {
    const line = 128;
    let current = '';
    headings.forEach(({id, heading}) => {
      if (heading.getBoundingClientRect().top <= line) {
        current = id;
      }
    });
    mark(current);
  };

  const onScroll = () => fromScroll();
  const onClick = (event) => {
    const link = event.currentTarget;
    mark(lessonId(link));
  };

  links.forEach((link) => link.addEventListener('click', onClick));
  window.addEventListener('scroll', onScroll, {passive: true});
  window.addEventListener('hashchange', onScroll);
  fromScroll();

  stop = () => {
    links.forEach((link) => link.removeEventListener('click', onClick));
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('hashchange', onScroll);
    stop = () => {};
  };
}

export function onRouteDidUpdate() {
  if (ExecutionEnvironment.canUseDOM) {
    window.requestAnimationFrame(watchChapter);
  }
}
