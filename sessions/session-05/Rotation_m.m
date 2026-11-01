clc
figure(1);clf;hold on
x=1;
y=1;
plot(x,y,'.r','Markersize',40)
axis([-5 5 -5 5])
grid
t=180;
R=[cosd(t),-sind(t)
    sind(t) cosd(t)];
M=R*[x;y];
xp=M(1);yp=M(2)
plot(xp,yp,'.k','Markersize',40)