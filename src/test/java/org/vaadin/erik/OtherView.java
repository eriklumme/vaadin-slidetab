package org.vaadin.erik;

import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.router.RouterLink;

@Route
public class OtherView extends Div {

    public OtherView() {
        add(new RouterLink("Go back", DemoView.class));
    }
}
