import { AppPage } from './app.po';

describe('fortuna_ui App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getHeader()).toContain('Fortune UI');
  });
});
