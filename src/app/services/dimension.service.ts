import { Injectable, signal } from '@angular/core';

enum ScreenType {
  Desktop = 'desktop',
  Tablet = 'tablet',
  Mobile = 'mobile',
}

@Injectable({
  providedIn: 'root',
})

export class DimensionService {

  constructor() {
    this.screenType.set(this.getScreenType());
    this.isMobile.set(this.screenType() === ScreenType.Mobile);
    this.isTablet.set(this.screenType() === ScreenType.Tablet);
    this.isDesktop.set(this.screenType() === ScreenType.Desktop);

    this.subscribeToWindowResize();
  }

  public screenType = signal<ScreenType>(ScreenType.Desktop);
  public isMobile = signal(false);
  public isTablet = signal(false);
  public isDesktop = signal(true);

  private tabletBreakpoint = 960;
  private mobileBreakpoint = 480;

  private subscribeToWindowResize(): void {
    window.onresize = () => {
      this.screenType.set(this.getScreenType());

      this.isMobile.set(this.screenType() === ScreenType.Mobile);
      this.isTablet.set(this.screenType() === ScreenType.Tablet);
      this.isDesktop.set(this.screenType() === ScreenType.Desktop);
    };
  }

  private getScreenType(): ScreenType {
    const innerWidth = window.innerWidth;

    if (innerWidth <= this.tabletBreakpoint) {
        if (innerWidth <= this.mobileBreakpoint) {
            return ScreenType.Mobile;
        } else {
            return ScreenType.Tablet;
        }
    } else {
        return ScreenType.Desktop;
    }
  }

}
