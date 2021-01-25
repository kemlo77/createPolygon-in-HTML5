import { expect } from 'chai';
import { NegativePolygonArea } from '../built/NegativePolygonArea';
import { Coordinate } from '../src/shape/Coordinate';




describe('NegativePolygonArea', () => {


    it('constructor - zero arguments', () => {
        const polygonArea: NegativePolygonArea = new NegativePolygonArea();
        expect(polygonArea.vertices.length).to.equal(0);
        expect(polygonArea.isClosed).to.equal(false);
        expect(polygonArea.name).to.equal('Negative_0');
    });

    it('constructor - one arguments', () => {
        const coordinates: Coordinate[] = [{ x: 100, y: 100 }, { x: 300, y: 100 }, { x: 150, y: 300 }];
        const polygonArea: NegativePolygonArea = new NegativePolygonArea(coordinates);
        expect(polygonArea.vertices.length).to.equal(3);
        expect(polygonArea.isClosed).to.equal(true);
        expect(polygonArea.name).to.equal('Negative_1');
    });


    it('default color', () => {
        const polygonArea: NegativePolygonArea = new NegativePolygonArea();
        expect(polygonArea.color).to.equal('128,0,0');
    });

    it('setting the static color', () => {
        NegativePolygonArea.setColor('10,10,10');
        const polygonArea: NegativePolygonArea = new NegativePolygonArea();
        expect(polygonArea.color).to.equal('10,10,10');
    });

    it('setting the name', () => {
        const area: NegativePolygonArea = new NegativePolygonArea();
        area.name = 'newName';
        expect(area.name).to.equal('newName');
    });

});