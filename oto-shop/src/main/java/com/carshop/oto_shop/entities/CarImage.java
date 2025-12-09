package com.carshop.oto_shop.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "car_images")
public class CarImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "image_url", nullable = false)
    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_id", nullable = false)
    private Car car;

    public CarImage() {}

    public CarImage(String imageUrl, Car car) {
        this.imageUrl = imageUrl;
        this.car = car;
    }

    // Getters & Setters...
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public Car getCar() { return car; }
    public void setCar(Car car) { this.car = car; }
}